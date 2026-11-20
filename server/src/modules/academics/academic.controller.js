import prisma from '../../db.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const listProgramSemesters = async (req, res, next) => {
  try {
    const { programId } = req.params;

    // Verify program belongs to this institution
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
    });

    if (!program) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Program not found in this institution');
    }

    const semesters = await prisma.semester.findMany({
      where: { programId },
      include: {
        subjects: {
          orderBy: { subjectCode: 'asc' },
        },
      },
      orderBy: { semesterNumber: 'asc' },
    });

    return successResponse(res, semesters);
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const { subjectCode, subjectName, maxMarks, credits } = req.body;

    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: {
        program: true,
      },
    });

    if (!semester || semester.program.institutionId !== req.institutionId) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Semester not found in this institution');
    }

    // Check duplicate subject code in this semester
    const existingSubject = await prisma.subject.findUnique({
      where: {
        semesterId_subjectCode: {
          semesterId,
          subjectCode,
        },
      },
    });

    if (existingSubject) {
      return errorResponse(res, 409, 'DUPLICATE_SUBJECT', 'A subject with this code already exists in this semester');
    }

    const subject = await prisma.subject.create({
      data: {
        semesterId,
        subjectCode,
        subjectName,
        maxMarks,
        credits: credits || null,
      },
    });

    return successResponse(res, subject, 'Subject created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listSemesterSubjects = async (req, res, next) => {
  try {
    const { semesterId } = req.params;

    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: { program: true },
    });

    if (!semester || semester.program.institutionId !== req.institutionId) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Semester not found');
    }

    const subjects = await prisma.subject.findMany({
      where: { semesterId },
      orderBy: { subjectCode: 'asc' },
    });

    return successResponse(res, subjects);
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { subjectCode, subjectName, maxMarks, credits } = req.body;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        semester: {
          include: { program: true },
        },
      },
    });

    if (!subject || subject.semester.program.institutionId !== req.institutionId) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Subject not found in this institution');
    }

    if (subjectCode && subjectCode !== subject.subjectCode) {
      const duplicate = await prisma.subject.findUnique({
        where: {
          semesterId_subjectCode: {
            semesterId: subject.semesterId,
            subjectCode,
          },
        },
      });
      if (duplicate) {
        return errorResponse(res, 409, 'DUPLICATE_SUBJECT', 'Subject code already in use in this semester');
      }
    }

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        ...(subjectCode && { subjectCode }),
        ...(subjectName && { subjectName }),
        ...(maxMarks && { maxMarks }),
        ...(credits !== undefined && { credits }),
      },
    });

    return successResponse(res, updated, 'Subject updated successfully');
  } catch (error) {
    next(error);
  }
};

export const recordMarks = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { subjectId, marksObtained, grade, resultStatus } = req.body;

    // 1. Validate student belongs to active institution
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        institutionId: req.institutionId,
        archivedAt: null,
      },
      include: {
        class: {
          include: {
            faculty: { select: { userId: true } },
          },
        },
      },
    });

    if (!student) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Student record not found in this institution');
    }

    // 2. If FACULTY, verify access to this student's class
    if (req.userRole === 'FACULTY') {
      const isAssigned = student.class.faculty.some((f) => f.userId === req.user.id);
      if (!isAssigned) {
        return errorResponse(res, 403, 'FORBIDDEN', 'You are not assigned to record marks for this student');
      }
    }

    // 3. Validate subject belongs to this institution and matches student's program
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        semester: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!subject || subject.semester.program.institutionId !== req.institutionId) {
      return errorResponse(res, 404, 'NOT_FOUND', 'Subject not found in this institution');
    }

    if (subject.semester.programId !== student.class.programId) {
      return errorResponse(
        res,
        400,
        'PROGRAM_MISMATCH',
        'Subject belongs to a different program than the student\'s enrolled class program'
      );
    }

    // 4. Validate marksObtained <= subject.maxMarks
    const maxMarksNum = parseFloat(subject.maxMarks);
    if (marksObtained > maxMarksNum) {
      return errorResponse(
        res,
        400,
        'MARKS_EXCEED_MAX',
        `Marks obtained (${marksObtained}) cannot exceed maximum marks (${maxMarksNum}) for ${subject.subjectName}`
      );
    }

    if (marksObtained < 0) {
      return errorResponse(res, 400, 'INVALID_MARKS', 'Marks obtained cannot be negative');
    }

    // Auto calculate resultStatus if not provided: >= 40% is PASS
    let status = resultStatus;
    if (!status) {
      status = marksObtained >= maxMarksNum * 0.4 ? 'PASS' : 'FAIL';
    }

    // 5. Upsert mark record
    const mark = await prisma.studentMark.upsert({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId,
        },
      },
      update: {
        marksObtained,
        grade: grade || null,
        resultStatus: status,
        updatedByUserId: req.user.id,
      },
      create: {
        studentId,
        subjectId,
        marksObtained,
        grade: grade || null,
        resultStatus: status,
        updatedByUserId: req.user.id,
      },
      include: {
        subject: true,
        updatedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(res, mark, 'Student marks recorded successfully');
  } catch (error) {
    next(error);
  }
};

export const getStudentMarks = async (req, res, next) => {
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
            faculty: { select: { userId: true } },
          },
        },
        marks: {
          include: {
            subject: true,
            updatedBy: { select: { id: true, name: true } },
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
        return errorResponse(res, 403, 'FORBIDDEN', 'Access denied to this student\'s records');
      }
    }

    const marksMap = new Map();
    student.marks.forEach((m) => {
      marksMap.set(m.subjectId, m);
    });

    // Group subjects and recorded marks by semester
    const semesters = student.class.program.semesters.map((sem) => {
      const subjectsWithMarks = sem.subjects.map((sub) => {
        const mark = marksMap.get(sub.id);
        return {
          id: sub.id,
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          maxMarks: sub.maxMarks,
          credits: sub.credits,
          marksObtained: mark ? mark.marksObtained : null,
          grade: mark ? mark.grade : null,
          resultStatus: mark ? mark.resultStatus : null,
          updatedAt: mark ? mark.updatedAt : null,
          updatedBy: mark ? mark.updatedBy : null,
          hasMark: !!mark,
        };
      });

      return {
        id: sem.id,
        semesterNumber: sem.semesterNumber,
        name: sem.name,
        subjects: subjectsWithMarks,
        totalSubjects: subjectsWithMarks.length,
        gradedSubjects: subjectsWithMarks.filter((s) => s.hasMark).length,
      };
    });

    return successResponse(res, {
      student: {
        id: student.id,
        studentName: student.studentName,
        enrollmentNumber: student.enrollmentNumber,
        rollNumber: student.rollNumber,
        admissionYear: student.admissionYear,
        className: student.class.name,
        programName: student.class.program.name,
      },
      semesters,
    });
  } catch (error) {
    next(error);
  }
};
