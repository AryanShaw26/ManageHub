import prisma from '../../db.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const listPrograms = async (req, res, next) => {
  try {
    const programs = await prisma.program.findMany({
      where: {
        institutionId: req.institutionId,
        archivedAt: null,
      },
      include: {
        _count: {
          select: {
            classes: { where: { archivedAt: null } },
            semesters: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, programs);
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    const { name, department, durationYears } = req.body;

    // Use a transaction to create program and automatically generate semesters 1 through 8
    const program = await prisma.$transaction(async (tx) => {
      const newProgram = await tx.program.create({
        data: {
          institutionId: req.institutionId,
          name,
          department: department || null,
          durationYears: durationYears || 4,
        },
      });

      // Automatically create semester records 1 to 8
      const semestersData = Array.from({ length: 8 }, (_, i) => ({
        programId: newProgram.id,
        semesterNumber: i + 1,
        name: `Semester ${i + 1}`,
      }));

      await tx.semester.createMany({
        data: semestersData,
      });

      return newProgram;
    });

    // Return program with its semesters
    const fullProgram = await prisma.program.findUnique({
      where: { id: program.id },
      include: {
        semesters: {
          orderBy: { semesterNumber: 'asc' },
        },
      },
    });

    return successResponse(res, fullProgram, 'Program and semesters 1–8 created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getProgram = async (req, res, next) => {
  try {
    const { programId } = req.params;

    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        institutionId: req.institutionId,
      },
      include: {
        semesters: {
          orderBy: { semesterNumber: 'asc' },
          include: {
            subjects: {
              orderBy: { subjectCode: 'asc' },
            },
          },
        },
        classes: {
          where: { archivedAt: null },
          include: {
            _count: { select: { students: { where: { archivedAt: null } } } },
          },
        },
      },
    });

    if (!program) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Program not found in this institution');
    }

    return successResponse(res, program);
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const { name, department, durationYears } = req.body;

    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!program) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Program not found');
    }

    const updated = await prisma.program.update({
      where: { id: programId },
      data: {
        ...(name && { name }),
        ...(department !== undefined && { department }),
        ...(durationYears && { durationYears }),
      },
    });

    return successResponse(res, updated, 'Program updated successfully');
  } catch (error) {
    next(error);
  }
};

export const archiveProgram = async (req, res, next) => {
  try {
    const { programId } = req.params;

    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!program) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Program not found');
    }

    await prisma.program.update({
      where: { id: programId },
      data: { archivedAt: new Date() },
    });

    return successResponse(res, null, 'Program archived successfully');
  } catch (error) {
    next(error);
  }
};
