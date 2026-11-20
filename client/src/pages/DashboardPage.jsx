import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  School,
  BookOpen,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MetricCard, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/EmptyState';

export const DashboardPage = () => {
  const { user, institution, role, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [instData, studentsData, classesData] = await Promise.all([
          api.get('/institution'),
          api.get('/students', { limit: 5 }),
          api.get('/classes'),
        ]);

        if (instData?.data?.metrics) {
          setMetrics(instData.data.metrics);
        }
        if (studentsData?.data?.students) {
          setRecentStudents(studentsData.data.students);
        }
        if (classesData?.data) {
          setClasses(classesData.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  const isBrandNew = metrics && metrics.totalStudents === 0 && metrics.totalClasses === 0 && metrics.totalPrograms === 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-bento bg-gradient-to-r from-brand-100/90 via-surface to-brand-50 border border-brand-200 p-6 sm:p-8 shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-200/80 text-ink-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institutional Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-ink-700 max-w-xl">
            {institution?.name} • Code <span className="font-mono font-bold">{institution?.institutionCode}</span> • Role: {role}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/app/students">
            <Button variant="primary" icon={PlusCircle}>
              Add Student
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/app/classes">
              <Button variant="outline" icon={School}>
                Create Class
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metric Cards Bento Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          label="Total Students"
          value={metrics?.totalStudents ?? 0}
          icon={Users}
          accent={true}
          helper="Enrolled students"
        />
        <MetricCard
          label="Classes / Batches"
          value={metrics?.totalClasses ?? 0}
          icon={School}
          helper="Active sections"
        />
        <MetricCard
          label="Programs"
          value={metrics?.totalPrograms ?? 0}
          icon={BookOpen}
          helper="Academic programs"
        />
        <MetricCard
          label="Faculty Members"
          value={metrics?.totalFaculty ?? 0}
          icon={UserCheck}
          helper="Teaching staff"
        />
      </div>

      {/* Onboarding State for Newly Registered Institutions */}
      {isBrandNew && (
        <Card variant="accent" className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-400 flex items-center justify-center mx-auto text-ink-900">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-ink-900">Your workspace is ready!</h2>
          <p className="text-sm text-ink-700 max-w-md mx-auto">
            Get started by creating your first academic program, setting up a class batch, and adding students.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/app/programs">
              <Button variant="primary" icon={BookOpen}>
                1. Create Program
              </Button>
            </Link>
            <Link to="/app/classes">
              <Button variant="secondary" icon={School}>
                2. Create Class
              </Button>
            </Link>
            <Link to="/app/students">
              <Button variant="outline" icon={Users}>
                3. Add Student
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Bento Grid: Recent Students & Class Overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Students Table (8 cols) */}
        <div className="lg:col-span-8 bento-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-ink-900">Recent Student Records</h2>
              <p className="text-xs text-ink-500">Latest enrolled students across active classes</p>
            </div>
            <Link to="/app/students" className="text-xs font-semibold text-brand-600 hover:text-brand-500 flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentStudents.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-500">
              No students enrolled yet. Click "Add Student" to record your first student.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-ink-500 uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Student Name</th>
                    <th className="pb-2.5 font-semibold">Enrollment No</th>
                    <th className="pb-2.5 font-semibold">Class / Section</th>
                    <th className="pb-2.5 font-semibold">Roll No</th>
                    <th className="pb-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-canvas transition-colors">
                      <td className="py-3 font-semibold text-ink-900">
                        {st.studentName}
                      </td>
                      <td className="py-3 font-mono text-ink-700">{st.enrollmentNumber}</td>
                      <td className="py-3 text-ink-700">
                        {st.class?.name} {st.class?.section ? `(${st.class.section})` : ''}
                      </td>
                      <td className="py-3 font-medium text-ink-900">{st.rollNumber}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/app/students/${st.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-900 hover:text-brand-600"
                        >
                          <span>Profile</span>
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

        {/* Classes Overview (4 cols) */}
        <div className="lg:col-span-4 bento-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-ink-900">Active Batches</h2>
              <p className="text-xs text-ink-500">Classes & assigned faculty</p>
            </div>
            <Link to="/app/classes" className="text-xs font-semibold text-brand-600 hover:text-brand-500 flex items-center gap-1">
              <span>All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {classes.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-500">
              No classes created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {classes.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to={`/app/classes/${c.id}`}
                  className="block p-3 rounded-xl border border-border hover:border-brand-300 hover:bg-canvas transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-ink-900 truncate">{c.name}</span>
                    <Badge variant="brand" size="sm">
                      {c.studentCount} students
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-ink-500">
                    <span>Batch {c.batchYear} • Sec {c.section || 'General'}</span>
                    <span className="truncate max-w-[120px]">
                      {c.faculty?.length > 0 ? c.faculty[0].name : 'No faculty assigned'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
