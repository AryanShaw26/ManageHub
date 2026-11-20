import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  School,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';

export const StudentsPage = () => {
  const { isAdmin, isFaculty } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedClassId, setSelectedClassId] = useState(searchParams.get('classId') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    enrollmentNumber: '',
    rollNumber: '',
    classId: '',
    admissionYear: new Date().getFullYear(),
    email: '',
    phone: '',
    dateOfBirth: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Archive state
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studRes, classRes] = await Promise.all([
        api.get('/students', {
          search: searchTerm || undefined,
          classId: selectedClassId || undefined,
          page: currentPage,
          limit: 10,
        }),
        api.get('/classes'),
      ]);

      if (studRes?.data) {
        setStudents(studRes.data.students);
        setPagination(studRes.data.pagination);
      }
      if (classRes?.data) {
        setClasses(classRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedClassId, currentPage]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      studentName: '',
      enrollmentNumber: '',
      rollNumber: '',
      classId: selectedClassId || classes[0]?.id || '',
      admissionYear: new Date().getFullYear(),
      email: '',
      phone: '',
      dateOfBirth: '',
    });
    setFieldErrors({});
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (st) => {
    setEditingStudent(st);
    setFormData({
      studentName: st.studentName,
      enrollmentNumber: st.enrollmentNumber,
      rollNumber: st.rollNumber,
      classId: st.classId,
      admissionYear: st.admissionYear,
      email: st.email || '',
      phone: st.phone || '',
      dateOfBirth: st.dateOfBirth ? st.dateOfBirth.split('T')[0] : '',
    });
    setFieldErrors({});
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        admissionYear: parseInt(formData.admissionYear, 10),
      };

      if (editingStudent) {
        await api.patch(`/students/${editingStudent.id}`, payload);
      } else {
        await api.post('/students', payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        const errs = {};
        err.details.forEach((d) => {
          errs[d.field || d.path] = d.message;
        });
        setFieldErrors(errs);
      }
      setFormError(err.message || 'Failed to save student record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiveLoading(true);
    try {
      await api.delete(`/students/${archiveTarget.id}`);
      setArchiveTarget(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to archive student');
    } finally {
      setArchiveLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Student Directory</h1>
          <p className="text-sm text-ink-500">
            {isFaculty
              ? 'Students enrolled in your assigned classes.'
              : 'Search, enroll, and manage student profiles and semester records.'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add Student
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Row */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, enrollment no, or roll no..."
            className="w-full text-xs rounded-lg border border-border bg-canvas pl-9 pr-3.5 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs rounded-lg border border-border bg-canvas px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">All Classes & Batches</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section ? `(${c.section})` : ''}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || selectedClassId) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedClassId('');
              setCurrentPage(1);
            }}
            className="text-xs text-ink-500 hover:text-ink-900 underline whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Students Data Display */}
      {loading ? (
        <LoadingSkeleton count={5} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description={
            searchTerm || selectedClassId
              ? 'No students matched your search criteria.'
              : 'Add your first student to an active class to begin tracking academic records.'
          }
          actionLabel="Add Student"
          actionIcon={Plus}
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block rounded-bento bg-surface border border-border overflow-hidden shadow-warm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-canvas border-b border-border text-ink-500 uppercase font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Enrollment No</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Class / Program</th>
                  <th className="py-3.5 px-4">Admission</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-canvas/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-ink-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-ink-900 font-bold flex items-center justify-center shrink-0">
                          {getInitials(st.studentName)}
                        </div>
                        <div>
                          <div className="font-bold text-ink-900">{st.studentName}</div>
                          {st.email && <div className="text-[11px] text-ink-500">{st.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-ink-700">
                      {st.enrollmentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-ink-900">{st.rollNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ink-900">{st.class?.name}</div>
                      <div className="text-[11px] text-ink-500">
                        {st.class?.program?.name} {st.class?.section ? `(Sec ${st.class.section})` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-700">{st.admissionYear}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/app/students/${st.id}`}
                          className="p-1.5 rounded-lg text-ink-700 hover:text-brand-600 hover:bg-brand-50"
                          title="View Marksheet & Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(st)}
                          className="p-1.5 rounded-lg text-ink-700 hover:text-ink-900 hover:bg-canvas"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setArchiveTarget(st)}
                            className="p-1.5 rounded-lg text-ink-500 hover:text-danger hover:bg-red-50"
                            title="Archive Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards (Visible only on mobile) */}
          <div className="md:hidden space-y-3">
            {students.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-surface border border-border shadow-warm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-ink-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(st.studentName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-ink-900">{st.studentName}</h3>
                      <p className="text-[11px] font-mono text-ink-500">{st.enrollmentNumber}</p>
                    </div>
                  </div>
                  <Badge variant="brand" size="sm">
                    Roll: {st.rollNumber}
                  </Badge>
                </div>

                <div className="text-xs text-ink-700 space-y-1 pt-1 border-t border-border">
                  <p>
                    <span className="text-ink-500 font-medium">Class: </span>
                    {st.class?.name}
                  </p>
                  <p>
                    <span className="text-ink-500 font-medium">Program: </span>
                    {st.class?.program?.name}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Link
                    to={`/app/students/${st.id}`}
                    className="text-xs font-bold text-ink-900 hover:text-brand-600 flex items-center gap-1"
                  >
                    <span>View Academic Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(st)}
                      className="p-1.5 text-ink-500 hover:text-ink-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setArchiveTarget(st)}
                        className="p-1.5 text-ink-500 hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border text-xs text-ink-700">
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} students
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <span className="font-semibold px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Register New Student'}
        description="Enroll student into an active academic class with unique enrollment identifier"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Full Name"
              name="studentName"
              value={formData.studentName}
              onChange={handleFormChange}
              placeholder="e.g. Alex Mercer"
              required
              error={fieldErrors.studentName}
            />

            <Select
              label="Assigned Class"
              name="classId"
              value={formData.classId}
              onChange={handleFormChange}
              required
              error={fieldErrors.classId}
            >
              <option value="">Select Class / Batch</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(${c.section})` : ''} - {c.program?.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Enrollment Number"
              name="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={handleFormChange}
              placeholder="Unique institution ID"
              required
              error={fieldErrors.enrollmentNumber}
            />

            <Input
              label="Class Roll Number"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleFormChange}
              placeholder="e.g. CS-01"
              required
              error={fieldErrors.rollNumber}
            />

            <Input
              label="Admission Year"
              name="admissionYear"
              type="number"
              min="1990"
              max="2100"
              value={formData.admissionYear}
              onChange={handleFormChange}
              required
              error={fieldErrors.admissionYear}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Student Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="student@institution.edu"
              error={fieldErrors.email}
            />

            <Input
              label="Contact Phone"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="+1-555-0100"
            />

            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleFormChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingStudent ? 'Save Changes' : 'Register Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Student Record"
        message={`Are you sure you want to archive "${archiveTarget?.studentName}" (${archiveTarget?.enrollmentNumber})? Academic marks will not be lost.`}
        loading={archiveLoading}
      />
    </div>
  );
};
