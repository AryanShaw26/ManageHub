import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Layers,
  Calendar,
  Building,
  Edit2,
  Trash2,
  ChevronRight,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { EmptyState, LoadingSkeleton } from '../components/ui/EmptyState';

export const ProgramsPage = () => {
  const { isAdmin } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formDuration, setFormDuration] = useState(4);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Program Detail / Semesters Modal
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Subject creation modal state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [targetSemester, setTargetSemester] = useState(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [credits, setCredits] = useState(4);
  const [subjectError, setSubjectError] = useState(null);

  // Archive state
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/programs');
      if (res?.data) {
        setPrograms(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormName('');
    setFormDept('');
    setFormDuration(4);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prog) => {
    setEditingProgram(prog);
    setFormName(prog.name);
    setFormDept(prog.department || '');
    setFormDuration(prog.durationYears || 4);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (editingProgram) {
        await api.patch(`/programs/${editingProgram.id}`, {
          name: formName,
          department: formDept || null,
          durationYears: parseInt(formDuration, 10),
        });
      } else {
        await api.post('/programs', {
          name: formName,
          department: formDept || null,
          durationYears: parseInt(formDuration, 10),
        });
      }
      setIsModalOpen(false);
      await loadPrograms();
    } catch (err) {
      setFormError(err.message || 'Failed to save program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = async (prog) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/programs/${prog.id}`);
      setSelectedProgram(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenAddSubject = (semester) => {
    setTargetSemester(semester);
    setSubjectCode('');
    setSubjectName('');
    setMaxMarks(100);
    setCredits(4);
    setSubjectError(null);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setSubjectError(null);
    try {
      await api.post(`/semesters/${targetSemester.id}/subjects`, {
        subjectCode,
        subjectName,
        maxMarks: parseFloat(maxMarks),
        credits: parseFloat(credits),
      });
      setIsSubjectModalOpen(false);
      // Refresh program details
      if (selectedProgram) {
        const res = await api.get(`/programs/${selectedProgram.id}`);
        setSelectedProgram(res.data);
      }
    } catch (err) {
      setSubjectError(err.message || 'Failed to create subject');
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiveLoading(true);
    try {
      await api.delete(`/programs/${archiveTarget.id}`);
      setArchiveTarget(null);
      await loadPrograms();
    } catch (err) {
      alert(err.message || 'Failed to archive program');
    } finally {
      setArchiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Academic Programs</h1>
          <p className="text-sm text-ink-500">
            Define degree programs with automatic 1–8 semesters and subject catalogs.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Add Program
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : programs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Academic Programs Yet"
          description="Create your institution's degree programs. Each program automatically gets 8 semesters configured for subjects and student marks."
          actionLabel="Create First Program"
          actionIcon={Plus}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bento-card bento-card-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-ink-900 font-bold">
                    <BookOpen className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(prog)}
                          className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-canvas"
                          title="Edit Program"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setArchiveTarget(prog)}
                          className="p-1.5 rounded-lg text-ink-500 hover:text-danger hover:bg-red-50"
                          title="Archive Program"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-ink-900 line-clamp-1">{prog.name}</h3>
                  <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>{prog.department || 'General Department'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs">
                  <Badge variant="brand" size="sm">
                    {prog.durationYears} Years Duration
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    8 Semesters
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {prog._count?.classes || 0} Classes
                  </Badge>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-500">Semesters 1 to 8</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDetail(prog)}
                  icon={ChevronRight}
                >
                  Manage Semesters
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? 'Edit Academic Program' : 'Create Academic Program'}
        description={
          editingProgram
            ? 'Update program title, department, or duration'
            : 'New programs automatically initialize with Semesters 1 through 8'
        }
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {formError}
            </div>
          )}
          <Input
            label="Program Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. B.Tech in Computer Science & Engineering"
            required
          />
          <Input
            label="Department / Faculty"
            value={formDept}
            onChange={(e) => setFormDept(e.target.value)}
            placeholder="e.g. Department of Engineering"
          />
          <Input
            label="Duration (Years)"
            type="number"
            min="1"
            max="10"
            value={formDuration}
            onChange={(e) => setFormDuration(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingProgram ? 'Save Changes' : 'Create Program & Semesters'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Program Semesters & Subject Catalog Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedProgram?.name || 'Program Semesters'}
        description="View semesters 1 through 8 and manage enrolled course subjects"
        maxWidth="max-w-4xl"
      >
        {detailLoading || !selectedProgram ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProgram.semesters?.map((sem) => (
                <div key={sem.id} className="p-4 rounded-xl border border-border bg-canvas space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-ink-900">{sem.name}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenAddSubject(sem)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-900 hover:text-brand-600 bg-surface px-2.5 py-1 rounded-lg border border-border"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Subject</span>
                      </button>
                    )}
                  </div>

                  {sem.subjects?.length === 0 ? (
                    <p className="text-xs text-ink-500 italic">No subjects added to {sem.name} yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {sem.subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-ink-900 mr-2">
                              {sub.subjectCode}
                            </span>
                            <span className="text-ink-700">{sub.subjectName}</span>
                          </div>
                          <span className="text-ink-500 font-medium shrink-0">
                            Max: {parseFloat(sub.maxMarks)} pts • {sub.credits || 0} cr
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Subject to Semester Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={`Add Subject to ${targetSemester?.name}`}
        description="Configure subject code, title, maximum marks, and credits"
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          {subjectError && (
            <div className="p-3 rounded-xl bg-red-50 text-danger text-xs border border-red-200">
              {subjectError}
            </div>
          )}
          <Input
            label="Subject Code"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            placeholder="e.g. CS101, MA201"
            required
          />
          <Input
            label="Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. Data Structures and Algorithms"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Maximum Marks"
              type="number"
              min="1"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              required
            />
            <Input
              label="Credits"
              type="number"
              step="0.5"
              min="0"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Academic Program"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? Academic history and classes will be preserved.`}
        loading={archiveLoading}
      />
    </div>
  );
};
