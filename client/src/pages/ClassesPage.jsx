import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  School,
  Plus,
  BookOpen,
  Users,
  UserCheck,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState, LoadingSkeleton } from '../components/ui/EmptyState';

export const ClassesPage = () => {
  const { isAdmin, isFaculty, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterProgram, setFilterProgram] = useState('');
  const [filterBatch, setFilterBatch] = useState('');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [programId, setProgramId] = useState('');
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [section, setSection] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Archive state
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classRes, progRes] = await Promise.all([
        api.get('/classes', {
          programId: filterProgram || undefined,
          batchYear: filterBatch || undefined,
        }),
        api.get('/programs'),
      ]);

      if (classRes?.data) setClasses(classRes.data);
      if (progRes?.data) setPrograms(progRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterProgram, filterBatch]);

  const openCreateModal = () => {
    setEditingClass(null);
    setClassName('');
    setProgramId(programs[0]?.id || '');
    setBatchYear(new Date().getFullYear());
    setSection('A');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setProgramId(cls.programId);
    setBatchYear(cls.batchYear);
    setSection(cls.section || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (editingClass) {
        await api.patch(`/classes/${editingClass.id}`, {
          name: className,
          programId,
          batchYear: parseInt(batchYear, 10),
          section: section || null,
        });
      } else {
        await api.post('/classes', {
          name: className,
          programId,
          batchYear: parseInt(batchYear, 10),
          section: section || null,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiveLoading(true);
    try {
      await api.delete(`/classes/${archiveTarget.id}`);
      setArchiveTarget(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to archive class');
    } finally {
      setArchiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Classes & Batches</h1>
          <p className="text-sm text-ink-500">
            {isFaculty
              ? 'Classes and batches currently assigned to you.'
              : 'Manage academic classes, sections, and faculty assignments.'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Create Class
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>
        <div className="w-48">
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="w-full text-xs rounded-lg border border-border bg-canvas px-3 py-1.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <input
            type="number"
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            placeholder="Batch Year"
            className="w-full text-xs rounded-lg border border-border bg-canvas px-3 py-1.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {(filterProgram || filterBatch) && (
          <button
            onClick={() => {
              setFilterProgram('');
              setFilterBatch('');
            }}
            className="text-xs text-ink-500 hover:text-ink-900 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Classes Grid */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={School}
          title="No Classes Found"
          description={
            isFaculty
              ? 'You have not been assigned to any classes yet. Please contact your institution administrator.'
              : 'Create your first academic class section and enroll students.'
          }
          actionLabel={isAdmin ? 'Create Class' : undefined}
          actionIcon={Plus}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bento-card bento-card-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-ink-900 font-bold">
                    <School className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(cls)}
                          className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-canvas"
                          title="Edit Class"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setArchiveTarget(cls)}
                          className="p-1.5 rounded-lg text-ink-500 hover:text-danger hover:bg-red-50"
                          title="Archive Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-ink-900">{cls.name}</h3>
                  <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{cls.program?.name}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <Badge variant="brand" size="sm">
                    Batch {cls.batchYear}
                  </Badge>
                  {cls.section && (
                    <Badge variant="neutral" size="sm">
                      Section {cls.section}
                    </Badge>
                  )}
                  <Badge variant="neutral" size="sm">
                    {cls.studentCount} Students
                  </Badge>
                </div>

                {/* Faculty indicator */}
                <div className="pt-2 text-xs text-ink-500 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="truncate">
                    {cls.faculty?.length > 0
                      ? cls.faculty.map((f) => f.name).join(', ')
                      : 'No faculty assigned'}
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-500">
                  {cls.studentCount} enrolled
                </span>
                <Link to={`/app/classes/${cls.id}`}>
                  <Button variant="outline" size="sm" icon={ExternalLink}>
                    View Class
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Academic Class' : 'Create Academic Class'}
        description="Configure class name, associated program, batch year, and section."
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {formError}
            </div>
          )}

          <Select
            label="Degree Program"
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            required
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Input
            label="Class Title"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. B.Tech CSE 2023–2027"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Batch Year"
              type="number"
              min="1990"
              max="2100"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              required
            />
            <Input
              label="Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. A, B, Morning"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingClass ? 'Save Changes' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Academic Class"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? Students and academic records will remain preserved.`}
        loading={archiveLoading}
      />
    </div>
  );
};
