import prisma from '../../db.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const listClasses = async (req, res, next) => {
  try {
    const { programId, batchYear } = req.query;

    const where = {
      institutionId: req.institutionId,
      archivedAt: null,
      ...(programId && { programId }),
      ...(batchYear && { batchYear: parseInt(batchYear, 10) }),
    };

    // If user is FACULTY, filter strictly to classes assigned to them
    if (req.userRole === 'FACULTY') {
      where.faculty = {
        some: {
          userId: req.user.id,
        },
      };
    }

    const classes = await prisma.academicClass.findMany({
      where,
      include: {
        program: {
          select: { id: true, name: true, department: true },
        },
        faculty: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            students: { where: { archivedAt: null } },
          },
        },
      },
      orderBy: [{ batchYear: 'desc' }, { name: 'asc' }],
    });

    const formatted = classes.map((c) => ({
      id: c.id,
      name: c.name,
      batchYear: c.batchYear,
      section: c.section,
      programId: c.programId,
      program: c.program,
      studentCount: c._count.students,
      faculty: c.faculty.map((f) => f.user),
      createdAt: c.createdAt,
    }));

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { programId, name, batchYear, section } = req.body;

    // Validate that the program belongs to active institution
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!program) {
      return errorResponse(res, 400, 'INVALID_PROGRAM', 'Selected program does not exist or does not belong to your institution');
    }

    const academicClass = await prisma.academicClass.create({
      data: {
        institutionId: req.institutionId,
        programId,
        name,
        batchYear,
        section: section || null,
      },
      include: {
        program: {
          select: { id: true, name: true, department: true },
        },
      },
    });

    return successResponse(res, academicClass, 'Class created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getClass = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const academicClass = await prisma.academicClass.findFirst({
      where: {
        id: classId,
        institutionId: req.institutionId,
      },
      include: {
        program: {
          include: {
            semesters: {
              orderBy: { semesterNumber: 'asc' },
            },
          },
        },
        faculty: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        students: {
          where: { archivedAt: null },
          orderBy: { rollNumber: 'asc' },
        },
      },
    });

    if (!academicClass) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Class not found in this institution');
    }

    // If FACULTY, verify assignment
    if (req.userRole === 'FACULTY') {
      const isAssigned = academicClass.faculty.some((f) => f.userId === req.user.id);
      if (!isAssigned) {
        return errorResponse(res, 403, 'FORBIDDEN', 'You are not assigned to this class');
      }
    }

    return successResponse(res, academicClass);
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { programId, name, batchYear, section } = req.body;

    const academicClass = await prisma.academicClass.findFirst({
      where: {
        id: classId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!academicClass) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Class not found');
    }

    if (programId && programId !== academicClass.programId) {
      const program = await prisma.program.findFirst({
        where: {
          id: programId,
          institutionId: req.institutionId,
          archivedAt: null,
        },
      });
      if (!program) {
        return errorResponse(res, 400, 'INVALID_PROGRAM', 'Selected program does not belong to this institution');
      }
    }

    const updated = await prisma.academicClass.update({
      where: { id: classId },
      data: {
        ...(programId && { programId }),
        ...(name && { name }),
        ...(batchYear && { batchYear }),
        ...(section !== undefined && { section }),
      },
      include: {
        program: { select: { id: true, name: true } },
      },
    });

    return successResponse(res, updated, 'Class updated successfully');
  } catch (error) {
    next(error);
  }
};

export const archiveClass = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const academicClass = await prisma.academicClass.findFirst({
      where: {
        id: classId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!academicClass) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Class not found');
    }

    await prisma.academicClass.update({
      where: { id: classId },
      data: { archivedAt: new Date() },
    });

    return successResponse(res, null, 'Class archived successfully');
  } catch (error) {
    next(error);
  }
};
