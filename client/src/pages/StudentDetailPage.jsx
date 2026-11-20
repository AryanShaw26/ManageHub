import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  School,
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Hash,
  Mail,
  Phone,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';

export const StudentDetailPage = () => {
  const { studentId } = useParams();
  const { isAdmin, isFaculty } = useAuth();

  const [student, setStudent] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterNumber, setSelectedSemesterNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Marks Entry Modal
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [targetSubject, setTargetSubject] = useState(null);
  const [marksObtained, setMarksObtained] = useState('');
  const [grade, setGrade] = useState('');
  const [resultStatus, setResultStatus] = useState('PASS');
  const [marksError, setMarksError] = useState(null);
  const [marksSaving, setMarksSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(null);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/students/${studentId}/marks`);
      if (res?.data) {
        setStudent(res.data.student);
        setSemesters(res.data.semesters);
      }
    } catch (err) {
      setError(err.message || 'Failed to load student academic record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const activeSemester = semesters.find((s) => s.semesterNumber === selectedSemesterNumber);

  const openMarksModal = (subject) => {
    setTargetSubject(subject);
    setMarksObtained(subject.marksObtained !== null ? subject.marksObtained : '');
    setGrade(subject.grade || '');
    setResultStatus(subject.resultStatus || 'PASS');
    setMarksError(null);
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setMarksError(null);

    const marksNum = parseFloat(marksObtained);
    const maxMarksNum = parseFloat(targetSubject.maxMarks);

    if (isNaN(marksNum)) {
      setMarksError('Please enter a valid number for marks obtained');
      return;
    }

    if (marksNum < 0) {
      setMarksError('Marks obtained cannot be negative');
      return;
    }

    if (marksNum > maxMarksNum) {
      setMarksError(`Marks obtained cannot exceed maximum marks (${maxMarksNum})`);
      return;
    }

    setMarksSaving(true);
    try {
      await api.post(`/students/${studentId}/marks`, {
        subjectId: targetSubject.id,
        marksObtained: marksNum,
        grade: grade || null,
        resultStatus: resultStatus || null,
      });

      setIsMarksModalOpen(false);
      setSaveSuccessNotice(`Marks for ${targetSubject.subjectName} updated successfully.`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);

      await loadStudentData();
    } catch (err) {
      setMarksError(err.message || 'Failed to save marks');
    } finally {
      setMarksSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) return <LoadingSkeleton count={4} />;

  if (error || !student) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-danger font-semibold">{error || 'Student not found'}</p>
        <Link to="/app/students">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Students
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div>
        <Link
          to="/app/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </Link>
      </div>

      {saveSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-success text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Student Profile Card (Section 9.5) */}
      <div className="rounded-bento bg-surface border border-border p-6 sm:p-8 shadow-warm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 border border-brand-300 text-ink-900 font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm">
              {getInitials(student.studentName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">
                  {student.studentName}
                </h1>
                <Badge variant="brand" size="sm">
                  Roll: {student.rollNumber}
                </Badge>
              </div>
              <p className="text-xs font-mono text-ink-500 mt-0.5">
                Enrollment ID: <span className="font-semibold text-ink-700">{student.enrollmentNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="md">
              Admission: {student.admissionYear}
            </Badge>
          </div>
        </div>

        {/* Academic Context Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border text-xs">
          <div>
            <span className="text-ink-500 uppercase font-semibold">Enrolled Class</span>
            <p className="font-bold text-ink-900 mt-0.5">{student.className}</p>
          </div>
          <div>
            <span className="text-ink-500 uppercase font-semibold">Degree Program</span>
            <p className="font-semibold text-ink-900 mt-0.5">{student.programName}</p>
          </div>
          <div>
            <span className="text-ink-500 uppercase font-semibold">Configured Semesters</span>
            <p className="font-semibold text-ink-900 mt-0.5">8 Semesters (1–8)</p>
          </div>
          <div>
            <span className="text-ink-500 uppercase font-semibold">Total Graded Subjects</span>
            <p className="font-semibold text-ink-900 mt-0.5">
              {semesters.reduce((acc, s) => acc + s.gradedSubjects, 0)} subjects
            </p>
          </div>
        </div>
      </div>

      {/* 8-Semester Academic Records Tabs */}
      <div className="bento-card space-y-6">
        <div>
          <h2 className="text-base font-bold text-ink-900">Semester-wise Academic Records</h2>
          <p className="text-xs text-ink-500">
            Select a semester to review subjects, maximum points, and record or update marks.
          </p>
        </div>

        {/* 8-Semester Pills Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
          {semesters.map((sem) => (
            <button
              key={sem.id}
              onClick={() => setSelectedSemesterNumber(sem.semesterNumber)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
                selectedSemesterNumber === sem.semesterNumber
                  ? 'bg-brand-500 text-ink-900 shadow-warm-sm scale-[1.02]'
                  : 'bg-canvas hover:bg-brand-50 text-ink-700 border border-border'
              }`}
            >
              <span>{sem.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedSemesterNumber === sem.semesterNumber
                    ? 'bg-ink-900/10 text-ink-900'
                    : 'bg-border text-ink-500'
                }`}
              >
                {sem.gradedSubjects}/{sem.totalSubjects}
              </span>
            </button>
          ))}
        </div>

        {/* Semester Subjects and Marks Table */}
        {!activeSemester || activeSemester.subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={`No Subjects in ${activeSemester?.name || 'this Semester'}`}
            description="No subjects have been configured for this semester under the student's degree program."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-canvas border-b border-border text-ink-500 uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeSemester.subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-900">
                      {sub.subjectCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink-900">{sub.subjectName}</td>
                    <td className="py-3.5 px-4 text-ink-700">{sub.credits || '—'}</td>
                    <td className="py-3.5 px-4 font-semibold text-ink-900">
                      {parseFloat(sub.maxMarks)}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.hasMark ? (
                        <span className="font-extrabold text-sm text-ink-900">
                          {parseFloat(sub.marksObtained)}
                        </span>
                      ) : (
                        <span className="text-ink-500 italic">Not recorded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-ink-900">
                      {sub.grade || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.resultStatus ? (
                        <Badge
                          variant={
                            sub.resultStatus === 'PASS'
                              ? 'success'
                              : sub.resultStatus === 'FAIL'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {sub.resultStatus}
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          PENDING
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={sub.hasMark ? 'secondary' : 'primary'}
                        size="sm"
                        icon={Edit3}
                        onClick={() => openMarksModal(sub)}
                      >
                        {sub.hasMark ? 'Update Marks' : 'Enter Marks'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Controlled Marks Entry Modal (Section 9.6) */}
      <Modal
        isOpen={isMarksModalOpen}
        onClose={() => setIsMarksModalOpen(false)}
        title={targetSubject ? `Marks Entry: ${targetSubject.subjectName}` : 'Enter Marks'}
        description={`Subject Code: ${targetSubject?.subjectCode} • Maximum Permitted Marks: ${targetSubject ? parseFloat(targetSubject.maxMarks) : 100}`}
      >
        <form onSubmit={handleSaveMarks} className="space-y-4">
          {marksError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {marksError}
            </div>
          )}

          <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs text-ink-700 flex items-center justify-between">
            <span>Course Maximum Limit:</span>
            <span className="font-extrabold text-ink-900 text-sm">
              {targetSubject ? parseFloat(targetSubject.maxMarks) : 100} Points
            </span>
          </div>

          <Input
            label="Marks Obtained"
            type="number"
            step="0.5"
            min="0"
            max={targetSubject ? parseFloat(targetSubject.maxMarks) : 100}
            value={marksObtained}
            onChange={(e) => setMarksObtained(e.target.value)}
            placeholder={`0 to ${targetSubject ? parseFloat(targetSubject.maxMarks) : 100}`}
            required
            hint={`Must be between 0 and ${targetSubject ? parseFloat(targetSubject.maxMarks) : 100}`}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Letter Grade (Optional)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. A+, A, B, C"
            />

            <Select
              label="Result Status"
              value={resultStatus}
              onChange={(e) => setResultStatus(e.target.value)}
            >
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="ABSENT">ABSENT</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setIsMarksModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={marksSaving}>
              Save Academic Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
