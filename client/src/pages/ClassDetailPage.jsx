import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  School,
  BookOpen,
  Calendar,
  Users,
  UserCheck,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';

export const ClassDetailPage = () => {
  const { classId } = useParams();
  const { isAdmin } = useAuth();
  const [academicClass, setAcademicClass] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assign faculty modal state
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [assignError, setAssignError] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const loadClassDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/classes/${classId}`);
      if (res?.data) {
        setAcademicClass(res.data);
      }

      if (isAdmin) {
        const memRes = await api.get('/users');
        if (memRes?.data) {
          setFacultyList(memRes.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassDetail();
  }, [classId]);

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    if (!selectedFacultyId) return;
    setAssignError(null);
    setAssigning(true);

    try {
      await api.post(`/classes/${classId}/faculty`, { userId: selectedFacultyId });
      setIsFacultyModalOpen(false);
      await loadClassDetail();
    } catch (err) {
      setAssignError(err.message || 'Failed to assign faculty member');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveFaculty = async (userId) => {
    try {
      await api.delete(`/classes/${classId}/faculty/${userId}`);
      await loadClassDetail();
    } catch (err) {
      alert(err.message || 'Failed to remove faculty assignment');
    }
  };

  if (loading) return <LoadingSkeleton count={4} />;

  if (error || !academicClass) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-danger font-semibold">{error || 'Class not found'}</p>
        <Link to="/app/classes">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Classes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/app/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classes</span>
        </Link>
      </div>

      {/* Class Hero Header Card */}
      <div className="rounded-bento bg-surface border border-border p-6 sm:p-8 shadow-warm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="brand">Batch {academicClass.batchYear}</Badge>
              {academicClass.section && (
                <Badge variant="neutral">Section {academicClass.section}</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
              {academicClass.name}
            </h1>
            <p className="text-sm text-ink-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{academicClass.program?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/app/students?classId=${academicClass.id}`}>
              <Button variant="primary" icon={UserPlus}>
                Add Student to Class
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border text-xs">
          <div>
            <span className="text-ink-500 uppercase font-semibold">Total Students</span>
            <p className="text-xl font-bold text-ink-900 mt-0.5">
              {academicClass.students?.length || 0}
            </p>
          </div>
          <div>
            <span className="text-ink-500 uppercase font-semibold">Program</span>
            <p className="font-semibold text-ink-900 mt-0.5 truncate">
              {academicClass.program?.name}
            </p>
          </div>
          <div>
            <span className="text-ink-500 uppercase font-semibold">Batch Year</span>
            <p className="font-semibold text-ink-900 mt-0.5">{academicClass.batchYear}</p>
          </div>
          <div>
            <span className="text-ink-500 uppercase font-semibold">Section</span>
            <p className="font-semibold text-ink-900 mt-0.5">{academicClass.section || 'General'}</p>
          </div>
        </div>
      </div>

      {/* Grid: Assigned Faculty & Student Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Faculty (4 cols) */}
        <div className="lg:col-span-4 bento-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-ink-900">Assigned Faculty</h2>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setSelectedFacultyId(facultyList[0]?.userId || '');
                  setAssignError(null);
                  setIsFacultyModalOpen(true);
                }}
              >
                Assign
              </Button>
            )}
          </div>

          {academicClass.faculty?.length === 0 ? (
            <p className="text-xs text-ink-500 py-4">
              No faculty members assigned to this class yet.
            </p>
          ) : (
            <div className="space-y-2">
              {academicClass.faculty.map((f) => (
                <div
                  key={f.user.id}
                  className="p-3 rounded-xl bg-canvas border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-ink-900">{f.user.name}</p>
                    <p className="text-[11px] text-ink-500">{f.user.email}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveFaculty(f.user.id)}
                      className="p-1 rounded text-ink-500 hover:text-danger"
                      title="Unassign Faculty"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Enrolled Students List (8 cols) */}
        <div className="lg:col-span-8 bento-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-ink-900">Enrolled Students</h2>
              <p className="text-xs text-ink-500">
                Sorted by roll number • {academicClass.students?.length || 0} students
              </p>
            </div>
          </div>

          {academicClass.students?.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-500">
              No students enrolled in this class yet. Click "Add Student to Class" above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-ink-500 uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Roll No</th>
                    <th className="pb-2.5 font-semibold">Student Name</th>
                    <th className="pb-2.5 font-semibold">Enrollment No</th>
                    <th className="pb-2.5 font-semibold">Admission</th>
                    <th className="pb-2.5 font-semibold text-right">Academic Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {academicClass.students.map((st) => (
                    <tr key={st.id} className="hover:bg-canvas transition-colors">
                      <td className="py-3 font-bold text-ink-900">{st.rollNumber}</td>
                      <td className="py-3 font-semibold text-ink-900">{st.studentName}</td>
                      <td className="py-3 font-mono text-ink-700">{st.enrollmentNumber}</td>
                      <td className="py-3 text-ink-500">{st.admissionYear}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/app/students/${st.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-ink-900 hover:text-brand-600"
                        >
                          <span>Marksheet</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assign Faculty Modal */}
      <Modal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        title="Assign Faculty to Class"
        description="Select an authorized faculty member from your institution"
      >
        <form onSubmit={handleAssignFaculty} className="space-y-4">
          {assignError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {assignError}
            </div>
          )}

          <Select
            label="Faculty Member"
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            required
          >
            {facultyList.map((f) => (
              <option key={f.userId} value={f.userId}>
                {f.name} ({f.email}) - {f.role}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsFacultyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={assigning}>
              Assign Faculty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
