import prisma from '../../db.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getInstitution = async (req, res, next) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: req.institutionId },
    });

    if (!institution) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Institution not found');
    }

    // Counts for dashboard
    const [totalStudents, totalClasses, totalPrograms, totalFaculty] = await Promise.all([
      prisma.student.count({
        where: { institutionId: req.institutionId, archivedAt: null },
      }),
      prisma.academicClass.count({
        where: { institutionId: req.institutionId, archivedAt: null },
      }),
      prisma.program.count({
        where: { institutionId: req.institutionId, archivedAt: null },
      }),
      prisma.institutionMember.count({
        where: { institutionId: req.institutionId, role: 'FACULTY' },
      }),
    ]);

    return successResponse(res, {
      institution,
      metrics: {
        totalStudents,
        totalClasses,
        totalPrograms,
        totalFaculty,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateInstitution = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const updated = await prisma.institution.update({
      where: { id: req.institutionId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
    });

    return successResponse(res, updated, 'Institution details updated successfully');
  } catch (error) {
    next(error);
  }
};
