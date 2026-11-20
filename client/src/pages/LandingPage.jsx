import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  School,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const LandingPage = () => {
  return (
    <div className="space-y-24 py-12 md:py-16">
      {/* 5.2 Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 border border-brand-300 text-ink-900 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Student records, organized</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 leading-[1.1]">
              Every student record. <br />
              <span className="text-ink-900 relative">
                One clear view.
                <span className="absolute left-0 bottom-1 w-full h-3 bg-brand-200 -z-10 rounded"></span>
              </span>
            </h1>

            <p className="text-lg text-ink-700 leading-relaxed max-w-xl">
              Organize classes, student profiles, and semester-wise academic records in one simple, secure workspace for your institution.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register">
                <Button size="lg" icon={ArrowRight}>
                  Get started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Log in
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-medium text-ink-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success" /> Multi-tenant isolation
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-600" /> 8-Semester marksheets
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Bento Product Preview */}
          <div className="lg:col-span-6" id="preview">
            <div className="relative rounded-bento p-4 sm:p-6 bg-gradient-to-tr from-brand-100/50 via-surface to-brand-50 border border-brand-200 shadow-warm-lg">
              {/* Product Preview Card */}
              <div className="rounded-2xl bg-surface border border-border p-5 shadow-warm space-y-4">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-ink-900">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink-900">ManageHub Workspace</div>
                      <div className="text-[10px] text-ink-500">Acme Institute of Technology</div>
                    </div>
                  </div>
                  <Badge variant="brand" size="sm">Active Session</Badge>
                </div>

                {/* Mini Metric Bento Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
                    <span className="text-[10px] uppercase font-bold text-ink-500">Students</span>
                    <p className="text-xl font-bold text-ink-900 mt-0.5">384</p>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas border border-border">
                    <span className="text-[10px] uppercase font-bold text-ink-500">Classes</span>
                    <p className="text-xl font-bold text-ink-900 mt-0.5">12</p>
                  </div>
                  <div className="p-3 rounded-xl bg-canvas border border-border">
                    <span className="text-[10px] uppercase font-bold text-ink-500">Semesters</span>
                    <p className="text-xl font-bold text-ink-900 mt-0.5">1–8</p>
                  </div>
                </div>

                {/* Sample Table Snippet with clearly fictional data */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-canvas px-3 py-2 text-[11px] font-bold text-ink-700 flex justify-between">
                    <span>Recent Student Records</span>
                    <span className="text-brand-600 font-semibold">Live Preview</span>
                  </div>
                  <div className="divide-y divide-border text-xs">
                    <div className="p-2.5 flex items-center justify-between bg-surface">
                      <div>
                        <div className="font-semibold text-ink-900">Alex Mercer</div>
                        <div className="text-[11px] text-ink-500">ENR-2023-001 • Section A</div>
                      </div>
                      <Badge variant="success" size="sm">PASS (88%)</Badge>
                    </div>
                    <div className="p-2.5 flex items-center justify-between bg-surface">
                      <div>
                        <div className="font-semibold text-ink-900">Beatrix Kiddo</div>
                        <div className="text-[11px] text-ink-500">ENR-2023-002 • Section A</div>
                      </div>
                      <Badge variant="success" size="sm">PASS (94%)</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.3 Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10" id="features">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="brand">Purpose Built</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Designed for institutional clarity
          </h2>
          <p className="text-base text-ink-500">
            A focused system with no bloated clutter. Everything educators and administrators need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Student Records (Large Span 2 cols) */}
          <div className="md:col-span-2 bento-card bento-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-100 flex items-center justify-center text-ink-900">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-ink-900">Student Directory & Profiles</h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                Maintain accurate student rosters with verified enrollment numbers, class roll numbers, and admission years. Instant search and filter by batch.
              </p>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-canvas border border-border">
              <div className="flex items-center gap-2 text-xs text-ink-500 mb-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search by name, enrollment, or roll number</span>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-brand-400 w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card 2: Class Organization */}
          <div className="bento-card bento-card-hover flex flex-col justify-between bg-brand-50/50 border-brand-200">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-200 flex items-center justify-center text-ink-900">
                <School className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Classes & Batches</h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                Organize students by program, batch year, and sections. Easily assign designated faculty.
              </p>
            </div>
            <div className="mt-4 flex gap-1.5 flex-wrap">
              <Badge variant="brand" size="sm">Batch 2023</Badge>
              <Badge variant="neutral" size="sm">Sec A</Badge>
              <Badge variant="neutral" size="sm">Sec B</Badge>
            </div>
          </div>

          {/* Card 3: Semester Marks */}
          <div className="bento-card bento-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-100 flex items-center justify-center text-ink-900">
                <BookOpen className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Semesters 1 to 8</h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                Full 8-semester structure with custom subjects, credits, maximum marks, and inline validation.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-ink-700">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Range checked (0 to maxMarks)</span>
            </div>
          </div>

          {/* Card 4: Institution Workspace (Wide span 4 cols) */}
          <div className="md:col-span-3 lg:col-span-4 bento-card bento-card-hover flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-ink-900">Isolated Multi-Tenant Architecture</h3>
              </div>
              <p className="text-sm text-ink-500">
                Every institution workspace is strictly isolated. Administrative roles and faculty access controls ensure that staff only see and edit their authorized classes and student records.
              </p>
            </div>
            <Link to="/register" className="shrink-0">
              <Button variant="secondary" icon={ArrowRight}>
                Register your institution
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5.4 How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" id="how-it-works">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="neutral">Simple Setup</Badge>
          <h2 className="text-3xl font-extrabold text-ink-900">Get up and running in 3 steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bento-card relative space-y-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-ink-900 font-extrabold flex items-center justify-center text-base shadow-warm-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-ink-900">Set up your institution</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              Register your workspace with your institution name and administrative account. Securely configure staff roles.
            </p>
          </div>

          <div className="bento-card relative space-y-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-ink-900 font-extrabold flex items-center justify-center text-base shadow-warm-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-ink-900">Organize programs & classes</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              Define academic programs with automatic 1–8 semesters. Add batches and assign faculty to specific sections.
            </p>
          </div>

          <div className="bento-card relative space-y-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-ink-900 font-extrabold flex items-center justify-center text-base shadow-warm-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-ink-900">Add students & manage marks</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              Register students with unique enrollment numbers. Record and update marks with instant validation and semester grouping.
            </p>
          </div>
        </div>
      </section>

      {/* 5.5 Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-hero bg-brand-100/90 border border-brand-300 p-8 sm:p-14 text-center space-y-6 shadow-warm-lg">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 max-w-2xl mx-auto tracking-tight">
            Ready to streamline your institution's academic records?
          </h2>
          <p className="text-base text-ink-700 max-w-xl mx-auto">
            Create your institution's ManageHub workspace today. No complex setup required.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight} className="shadow-warm">
                Create your institution
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
