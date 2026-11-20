-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('ADMIN', 'FACULTY');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PASS', 'FAIL', 'ABSENT');

-- CreateTable
CREATE TABLE "institutions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "institutionCode" VARCHAR(40) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_members" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'FACULTY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institution_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "department" VARCHAR(150),
    "durationYears" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_classes" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "batchYear" INTEGER NOT NULL,
    "section" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "academic_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_faculty" (
    "id" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "classId" UUID NOT NULL,
    "studentName" VARCHAR(150) NOT NULL,
    "enrollmentNumber" VARCHAR(80) NOT NULL,
    "rollNumber" VARCHAR(40) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "dateOfBirth" TIMESTAMP(3),
    "admissionYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "semesterId" UUID NOT NULL,
    "subjectCode" VARCHAR(50) NOT NULL,
    "subjectName" VARCHAR(180) NOT NULL,
    "maxMarks" DECIMAL(7,2) NOT NULL,
    "credits" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_marks" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "marksObtained" DECIMAL(7,2) NOT NULL,
    "grade" VARCHAR(10),
    "resultStatus" "ResultStatus",
    "updatedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_marks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institutionCode_key" ON "institutions"("institutionCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "institution_members_institutionId_idx" ON "institution_members"("institutionId");

-- CreateIndex
CREATE INDEX "institution_members_userId_idx" ON "institution_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "institution_members_institutionId_userId_key" ON "institution_members"("institutionId", "userId");

-- CreateIndex
CREATE INDEX "programs_institutionId_idx" ON "programs"("institutionId");

-- CreateIndex
CREATE INDEX "academic_classes_institutionId_idx" ON "academic_classes"("institutionId");

-- CreateIndex
CREATE INDEX "academic_classes_programId_idx" ON "academic_classes"("programId");

-- CreateIndex
CREATE INDEX "class_faculty_classId_idx" ON "class_faculty"("classId");

-- CreateIndex
CREATE INDEX "class_faculty_userId_idx" ON "class_faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "class_faculty_classId_userId_key" ON "class_faculty"("classId", "userId");

-- CreateIndex
CREATE INDEX "students_institutionId_classId_idx" ON "students"("institutionId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "students_institutionId_enrollmentNumber_key" ON "students"("institutionId", "enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_classId_rollNumber_key" ON "students"("classId", "rollNumber");

-- CreateIndex
CREATE INDEX "semesters_programId_idx" ON "semesters"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_programId_semesterNumber_key" ON "semesters"("programId", "semesterNumber");

-- CreateIndex
CREATE INDEX "subjects_semesterId_idx" ON "subjects"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_semesterId_subjectCode_key" ON "subjects"("semesterId", "subjectCode");

-- CreateIndex
CREATE INDEX "student_marks_studentId_idx" ON "student_marks"("studentId");

-- CreateIndex
CREATE INDEX "student_marks_subjectId_idx" ON "student_marks"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "student_marks_studentId_subjectId_key" ON "student_marks"("studentId", "subjectId");

-- AddForeignKey
ALTER TABLE "institution_members" ADD CONSTRAINT "institution_members_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_members" ADD CONSTRAINT "institution_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_faculty" ADD CONSTRAINT "class_faculty_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_faculty" ADD CONSTRAINT "class_faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_marks" ADD CONSTRAINT "student_marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_marks" ADD CONSTRAINT "student_marks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_marks" ADD CONSTRAINT "student_marks_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
