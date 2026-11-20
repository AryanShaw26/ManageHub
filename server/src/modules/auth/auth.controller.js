import prisma from '../../db.js';
import { hashPassword, comparePassword, signToken, generateInstitutionCode } from '../../utils/auth.js';
import { successResponse, errorResponse, AppError } from '../../utils/response.js';
import config from '../../config/index.js';

export const registerInstitution = async (req, res, next) => {
  try {
    const {
      institutionName,
      institutionEmail,
      adminName,
      adminEmail,
      password,
      phone,
      address,
    } = req.body;

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return errorResponse(res, 409, 'CONFLICT', 'An account with this administrator email already exists', [
        { field: 'adminEmail', message: 'Email already registered' },
      ]);
    }

    // Generate unique institution code
    let institutionCode = generateInstitutionCode(institutionName);
    let codeExists = await prisma.institution.findUnique({ where: { institutionCode } });
    let attempts = 0;
    while (codeExists && attempts < 5) {
      institutionCode = generateInstitutionCode(institutionName);
      codeExists = await prisma.institution.findUnique({ where: { institutionCode } });
      attempts++;
    }

    const passwordHash = await hashPassword(password);

    // Run creation atomically in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: institutionName,
          institutionCode,
          email: institutionEmail,
          phone: phone || null,
          address: address || null,
        },
      });

      const user = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          passwordHash,
          isActive: true,
        },
      });

      const membership = await tx.institutionMember.create({
        data: {
          institutionId: institution.id,
          userId: user.id,
          role: 'ADMIN',
        },
      });

      return { institution, user, membership };
    });

    const token = signToken({
      userId: result.user.id,
      institutionId: result.institution.id,
      role: 'ADMIN',
    });

    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
      res,
      {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        institution: {
          id: result.institution.id,
          name: result.institution.name,
          institutionCode: result.institution.institutionCode,
          email: result.institution.email,
        },
        role: 'ADMIN',
        // token intentionally omitted from response body — delivered via HttpOnly cookie only
      },
      'Institution and administrator account created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            institution: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated. Please contact your institution administrator.');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.memberships || user.memberships.length === 0) {
      return errorResponse(res, 403, 'NO_MEMBERSHIP', 'No active institution membership found for this user.');
    }

    const activeMembership = user.memberships[0];

    const token = signToken({
      userId: user.id,
      institutionId: activeMembership.institutionId,
      role: activeMembership.role,
    });

    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        institution: {
          id: activeMembership.institution.id,
          name: activeMembership.institution.name,
          institutionCode: activeMembership.institution.institutionCode,
          email: activeMembership.institution.email,
        },
        role: activeMembership.role,
        // token intentionally omitted from response body — delivered via HttpOnly cookie only
      },
      'Signed in successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    path: '/',
  });
  return successResponse(res, null, 'Signed out successfully');
};

export const getMe = async (req, res) => {
  return successResponse(res, {
    user: req.user,
    institution: req.institution,
    role: req.userRole,
  });
};
