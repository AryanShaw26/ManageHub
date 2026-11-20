import prisma from '../../db.js';
import { hashPassword } from '../../utils/auth.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const listMembers = async (req, res, next) => {
  try {
    const members = await prisma.institutionMember.findMany({
      where: { institutionId: req.institutionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = members.map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      isActive: m.user.isActive,
      joinedAt: m.createdAt,
    }));

    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
};

export const createFaculty = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { institutionId: req.institutionId },
        },
      },
    });

    if (user && user.memberships.length > 0) {
      return errorResponse(res, 409, 'CONFLICT', 'This user is already a member of your institution');
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      if (!user) {
        user = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            isActive: true,
          },
        });
      }

      const membership = await tx.institutionMember.create({
        data: {
          institutionId: req.institutionId,
          userId: user.id,
          role: 'FACULTY',
        },
      });

      return { user, membership };
    });

    return successResponse(
      res,
      {
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.membership.role,
        note: 'Faculty account registered. Share their sign-in email and password with them.',
      },
      'Faculty member added successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const membership = await prisma.institutionMember.findUnique({
      where: {
        institutionId_userId: {
          institutionId: req.institutionId,
          userId,
        },
      },
    });

    if (!membership) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Member not found in this institution');
    }

    // Prevent removing the last admin
    if (membership.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.institutionMember.count({
        where: {
          institutionId: req.institutionId,
          role: 'ADMIN',
        },
      });
      if (adminCount <= 1) {
        return errorResponse(res, 400, 'CANNOT_REMOVE_LAST_ADMIN', 'Cannot change role. The institution must have at least one administrator');
      }
    }

    const updated = await prisma.institutionMember.update({
      where: { id: membership.id },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(res, {
      membershipId: updated.id,
      userId: updated.user.id,
      name: updated.user.name,
      email: updated.user.email,
      role: updated.role,
    }, 'Member role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const assignClassFaculty = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { userId } = req.body;

    // Verify class belongs to institution
    const academicClass = await prisma.academicClass.findFirst({
      where: {
        id: classId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!academicClass) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Class not found in this institution');
    }

    // Verify user is a member of the same institution with FACULTY or ADMIN role
    const membership = await prisma.institutionMember.findUnique({
      where: {
        institutionId_userId: {
          institutionId: req.institutionId,
          userId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!membership) {
      return errorResponse(res, 400, 'INVALID_FACULTY', 'User is not a member of this institution');
    }

    const assignment = await prisma.classFaculty.upsert({
      where: {
        classId_userId: {
          classId,
          userId,
        },
      },
      update: {},
      create: {
        classId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(res, assignment, 'Faculty assigned to class successfully');
  } catch (error) {
    next(error);
  }
};

export const removeClassFaculty = async (req, res, next) => {
  try {
    const { classId, userId } = req.params;

    const academicClass = await prisma.academicClass.findFirst({
      where: {
        id: classId,
        institutionId: req.institutionId,
      },
    });

    if (!academicClass) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Class not found in this institution');
    }

    await prisma.classFaculty.deleteMany({
      where: {
        classId,
        userId,
      },
    });

    return successResponse(res, null, 'Faculty unassigned from class');
  } catch (error) {
    next(error);
  }
};
