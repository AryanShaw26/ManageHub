import { verifyToken } from '../utils/auth.js';
import { errorResponse, AppError } from '../utils/response.js';
import prisma from '../db.js';
import config from '../config/index.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies[config.cookieName]) {
      token = req.cookies[config.cookieName];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'Authentication is required to access this resource');
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'Invalid or expired authentication session');
    }

    // Fetch user and institution membership
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          include: {
            institution: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'User account is inactive or not found');
    }

    // Active institution can be selected from token or user's primary membership
    let activeMembership = null;
    if (decoded.institutionId) {
      activeMembership = user.memberships.find((m) => m.institutionId === decoded.institutionId);
    }
    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships[0];
    }

    if (!activeMembership) {
      return errorResponse(res, 403, 'NO_INSTITUTION', 'User has no active institution membership');
    }

    // Attach verified context
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    req.institutionId = activeMembership.institutionId;
    req.institution = activeMembership.institution;
    req.membership = activeMembership;
    req.userRole = activeMembership.role; // 'ADMIN' or 'FACULTY'

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (!allowedRoles.includes(req.userRole)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'You do not have permission to perform this action');
    }

    next();
  };
};

/**
 * For Faculty, verify whether the class is assigned to this faculty.
 * Admins are automatically authorized for all classes in the institution.
 */
export const verifyClassAccess = async (req, res, next) => {
  try {
    const classId = req.params.classId || req.body.classId;
    if (!classId) {
      return next();
    }

    // First ensure the class belongs to active institution
    const academicClass = await prisma.academicClass.findFirst({
      where: {
        id: classId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
      include: {
        faculty: true,
      },
    });

    if (!academicClass) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Class not found in this institution');
    }

    req.academicClass = academicClass;

    // If admin, allow
    if (req.userRole === 'ADMIN') {
      return next();
    }

    // If faculty, must be assigned to this class
    const isAssigned = academicClass.faculty.some((f) => f.userId === req.user.id);
    if (!isAssigned) {
      return errorResponse(res, 403, 'FORBIDDEN', 'Access denied. You are not assigned to this class');
    }

    next();
  } catch (error) {
    next(error);
  }
};
