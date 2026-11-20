import prisma from './db.js';
import { hashPassword } from './utils/auth.js';
import crypto from 'crypto';

// Safety guard: prevent accidental seed execution in production
if (process.env.NODE_ENV === 'production') {
  console.error('[seed] ERROR: Seed script cannot run in production (NODE_ENV=production).');
  console.error('[seed] This script creates synthetic development data — never run it on a live database.');
  process.exit(1);
}

async function seed() {
  console.log('Seeding synthetic demo records for ManageHub...');

  // Clean existing demo data if any
  const existingInst = await prisma.institution.findUnique({
    where: { institutionCode: 'ACME-DEMO' },
  });

  if (existingInst) {
    console.log('Demo institution ACME-DEMO already exists. Deleting to recreate clean state...');
    await prisma.institution.delete({ where: { id: existingInst.id } });
  }

  const generatedPassword = crypto.randomBytes(32).toString('hex');
  const passwordHash = await hashPassword(generatedPassword);

  // 1. Create Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'Acme Institute of Technology',
      institutionCode: 'ACME-DEMO',
      email: 'contact@acme.edu',
      phone: '+1-555-0199',
      address: '100 Innovation Parkway, Academic District',
    },
  });

  // 2. Create Admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins',
      email: 'admin@acme.edu',
      passwordHash,
      isActive: true,
    },
  });

  await prisma.institutionMember.create({
    data: {
      institutionId: institution.id,
      userId: adminUser.id,
      role: 'ADMIN',
    },
  });

  // 3. Create Faculty user
  const facultyUser = await prisma.user.create({
    data: {
      name: 'Prof. Alan Turing',
      email: 'faculty@acme.edu',
      passwordHash,
      isActive: true,
    },
  });

  await prisma.institutionMember.create({
    data: {
      institutionId: institution.id,
      userId: facultyUser.id,
      role: 'FACULTY',
    },
  });

  // 4. Create Program and Semesters 1 to 8
  const program = await prisma.program.create({
    data: {
      institutionId: institution.id,
      name: 'B.Tech in Computer Science & Engineering',
      department: 'Department of Computer Science',
      durationYears: 4,
    },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.semester.create({
      data: {
        programId: program.id,
        semesterNumber: i,
        name: `Semester ${i}`,
      },
    });
  }

  const semesters = await prisma.semester.findMany({
    where: { programId: program.id },
    orderBy: { semesterNumber: 'asc' },
  });

  // 5. Add Subjects to Semester 1 and 2
  const sem1 = semesters[0];
  const sem2 = semesters[1];

  const sub1 = await prisma.subject.create({
    data: {
      semesterId: sem1.id,
      subjectCode: 'CS101',
      subjectName: 'Introduction to Programming & Algorithms',
      maxMarks: 100,
      credits: 4,
    },
  });

  const sub2 = await prisma.subject.create({
    data: {
      semesterId: sem1.id,
      subjectCode: 'MA101',
      subjectName: 'Engineering Mathematics I',
      maxMarks: 100,
      credits: 4,
    },
  });

  const sub3 = await prisma.subject.create({
    data: {
      semesterId: sem2.id,
      subjectCode: 'CS102',
      subjectName: 'Data Structures & Applications',
      maxMarks: 100,
      credits: 4,
    },
  });

  // 6. Create Classes
  const classA = await prisma.academicClass.create({
    data: {
      institutionId: institution.id,
      programId: program.id,
      name: 'B.Tech CSE 2023-2027',
      batchYear: 2023,
      section: 'A',
    },
  });

  const classB = await prisma.academicClass.create({
    data: {
      institutionId: institution.id,
      programId: program.id,
      name: 'B.Tech CSE 2024-2028',
      batchYear: 2024,
      section: 'B',
    },
  });

  // 7. Assign Faculty Alan Turing to Class A
  await prisma.classFaculty.create({
    data: {
      classId: classA.id,
      userId: facultyUser.id,
    },
  });

  // 8. Create synthetic students in Class A
  const student1 = await prisma.student.create({
    data: {
      institutionId: institution.id,
      classId: classA.id,
      studentName: 'Alex Mercer',
      enrollmentNumber: 'ENR-2023-001',
      rollNumber: 'CS-01',
      email: 'alex.mercer@acme.student.demo',
      admissionYear: 2023,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      institutionId: institution.id,
      classId: classA.id,
      studentName: 'Beatrix Kiddo',
      enrollmentNumber: 'ENR-2023-002',
      rollNumber: 'CS-02',
      email: 'beatrix.k@acme.student.demo',
      admissionYear: 2023,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      institutionId: institution.id,
      classId: classA.id,
      studentName: 'Carlos Rivera',
      enrollmentNumber: 'ENR-2023-003',
      rollNumber: 'CS-03',
      email: 'carlos.r@acme.student.demo',
      admissionYear: 2023,
    },
  });

  // 9. Add sample marks
  await prisma.studentMark.create({
    data: {
      studentId: student1.id,
      subjectId: sub1.id,
      marksObtained: 88,
      grade: 'A',
      resultStatus: 'PASS',
      updatedByUserId: adminUser.id,
    },
  });

  await prisma.studentMark.create({
    data: {
      studentId: student1.id,
      subjectId: sub2.id,
      marksObtained: 76,
      grade: 'B',
      resultStatus: 'PASS',
      updatedByUserId: adminUser.id,
    },
  });

  await prisma.studentMark.create({
    data: {
      studentId: student2.id,
      subjectId: sub1.id,
      marksObtained: 94,
      grade: 'A+',
      resultStatus: 'PASS',
      updatedByUserId: facultyUser.id,
    },
  });

  console.log('Seed completed successfully!');
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
