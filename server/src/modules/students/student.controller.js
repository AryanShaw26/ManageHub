import prisma from '../../db.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const listStudents = async (req, res, next) => {
  try {
    const { search, classId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      institutionId: req.institutionId,
      archivedAt: null,
      ...(classId && { classId }),
    };

    // If user is FACULTY, restrict to students in their assigned classes
    if (req.userRole === 'FACULTY') {
      const assignedClasses = await prisma.classFaculty.findMany({
        where: { userId: req.user.id },
        select: { classId: true },
      });
      const assignedClassIds = assignedClasses.map((ac) => ac.classId);

      if (assignedClassIds.length === 0) {
        return successResponse(res, {
          students: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        });
      }

      if (classId) {
        if (!assignedClassIds.includes(classId)) {
          return successResponse(res, {
            students: [],
            pagination: { total: 0, page, limit, totalPages: 0 },
          });
        }
      } else {
        where.classId = { in: assignedClassIds };
      }
    }

    if (search) {
      where.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { enrollmentNumber: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              batchYear: true,
              section: true,
              program: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: [{ studentName: 'asc' }],
      }),
    ]);

    return successResponse(res, {
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const {
      classId,
      studentName,
      enrollmentNumber,
      rollNumber,
      email,
      phone,
      dateOfBirth,
      admissionYear,
    } = req.body;

    // Validate that class belongs to this institution
    const academicClass = await prisma.academicClass.findFirst({
      where: {
        id: classId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!academicClass) {
      return errorResponse(res, 400, 'INVALID_CLASS', 'The selected class does not belong to this institution or is archived');
    }

    // If FACULTY, check if assigned to this class
    if (req.userRole === 'FACULTY') {
      const isAssigned = await prisma.classFaculty.findUnique({
        where: {
          classId_userId: {
            classId,
            userId: req.user.id,
          },
        },
      });
      if (!isAssigned) {
        return errorResponse(res, 403, 'FORBIDDEN', 'You are not authorized to add students to this class');
      }
    }

    // Check duplicate enrollment number within institution
    const duplicateEnrollment = await prisma.student.findUnique({
      where: {
        institutionId_enrollmentNumber: {
          institutionId: req.institutionId,
          enrollmentNumber,
        },
      },
    });

    if (duplicateEnrollment) {
      return errorResponse(res, 409, 'DUPLICATE_ENROLLMENT', 'A student with this enrollment number already exists in your institution', [
        { field: 'enrollmentNumber', message: 'Enrollment number must be unique' },
      ]);
    }

    // Check duplicate roll number within the class
    const duplicateRoll = await prisma.student.findUnique({
      where: {
        classId_rollNumber: {
          classId,
          rollNumber,
        },
      },
    });

    if (duplicateRoll) {
      return errorResponse(res, 409, 'DUPLICATE_ROLL_NUMBER', 'A student with this roll number already exists in this class', [
        { field: 'rollNumber', message: 'Roll number must be unique within the class' },
      ]);
    }

    const student = await prisma.student.create({
      data: {
        institutionId: req.institutionId,
        classId,
        studentName,
        enrollmentNumber,
        rollNumber,
        email: email || null,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        admissionYear,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            program: { select: { id: true, name: true } },
          },
        },
      },
    });

    return successResponse(res, student, 'Student registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        institutionId: req.institutionId,
      },
      include: {
        class: {
          include: {
            program: {
              include: {
                semesters: {
                  orderBy: { semesterNumber: 'asc' },
                  include: {
                    subjects: {
                      orderBy: { subjectCode: 'asc' },
                    },
                  },
                },
              },
            },
            faculty: {
              select: { userId: true },
            },
          },
        },
        marks: {
          include: {
            subject: {
              include: {
                semester: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Student record not found in this institution');
    }

    // If FACULTY, verify access
    if (req.userRole === 'FACULTY') {
      const isAssigned = student.class.faculty.some((f) => f.userId === req.user.id);
      if (!isAssigned) {
        return errorResponse(res, 403, 'FORBIDDEN', 'Access denied. You are not assigned to this student\'s class');
      }
    }

    return successResponse(res, student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const {
      classId,
      studentName,
      enrollmentNumber,
      rollNumber,
      email,
      phone,
      dateOfBirth,
      admissionYear,
    } = req.body;

    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        institutionId: req.institutionId,
      },
      include: {
        class: {
          include: {
            faculty: { select: { userId: true } },
          },
        },
      },
    });

    if (!existingStudent) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Student record not found');
    }

    // Faculty authorization check
    if (req.userRole === 'FACULTY') {
      const isAssigned = existingStudent.class.faculty.some((f) => f.userId === req.user.id);
      if (!isAssigned) {
        return errorResponse(res, 403, 'FORBIDDEN', 'You are not assigned to edit this student');
      }
    }

    // Validate that target class belongs to this institution if changing class
    if (classId && classId !== existingStudent.classId) {
      if (req.userRole === 'FACULTY') {
        return errorResponse(res, 403, 'FORBIDDEN', 'Only administrators may transfer students between classes');
      }
      const targetClass = await prisma.academicClass.findFirst({
        where: {
          id: classId,
          institutionId: req.institutionId,
          archivedAt: null,
        },
      });
      if (!targetClass) {
        return errorResponse(res, 400, 'INVALID_CLASS', 'The selected class does not belong to your institution or is archived');
      }
    }

    const targetClassId = classId || existingStudent.classId;

    // Validate enrollmentNumber uniqueness if changed
    if (enrollmentNumber && enrollmentNumber !== existingStudent.enrollmentNumber) {
      const dup = await prisma.student.findUnique({
        where: {
          institutionId_enrollmentNumber: {
            institutionId: req.institutionId,
            enrollmentNumber,
          },
        },
      });
      if (dup) {
        return errorResponse(res, 409, 'DUPLICATE_ENROLLMENT', 'Enrollment number already in use by another student');
      }
    }

    // Validate rollNumber uniqueness in class if changed
    if ((rollNumber && rollNumber !== existingStudent.rollNumber) || (classId && classId !== existingStudent.classId)) {
      const targetRoll = rollNumber || existingStudent.rollNumber;
      const dup = await prisma.student.findUnique({
        where: {
          classId_rollNumber: {
            classId: targetClassId,
            rollNumber: targetRoll,
          },
        },
      });
      if (dup && dup.id !== studentId) {
        return errorResponse(res, 409, 'DUPLICATE_ROLL_NUMBER', 'Roll number already in use in this class');
      }
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(classId && { classId }),
        ...(studentName && { studentName }),
        ...(enrollmentNumber && { enrollmentNumber }),
        ...(rollNumber && { rollNumber }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(admissionYear && { admissionYear }),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            program: { select: { id: true, name: true } },
          },
        },
      },
    });

    return successResponse(res, updated, 'Student updated successfully');
  } catch (error) {
    next(error);
  }
};

export const archiveStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!student) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Student record not found');
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { archivedAt: new Date() },
    });

    return successResponse(res, null, 'Student archived successfully');
  } catch (error) {
    next(error);
  }
};
