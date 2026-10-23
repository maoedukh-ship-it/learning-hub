'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { CourseVisual } from '@/components/course-visual';
import { useHub } from '@/components/hub-context';
import { BRAND } from '@/lib/brand';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { courses, categories, learningPaths, certificates } = useHub();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const publishedCourses = useMemo(
    () => courses.filter((c) => c.status === 'published'),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    return publishedCourses.filter((course) => {
      const matchesCat =
        selectedCategory === 'all' || course.categoryId === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.shortDescription.toLowerCase().includes(q) ||
        course.categoryName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [publishedCourses, selectedCategory, searchQuery]);

  return (
    <PublicShell>
      {/* 1. Hero Section — Split 2-Column Enterprise Layout */}
      <section className="bg-[#0B1F3A] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="text-xs font-medium text-blue-300 tracking-wide">
                {BRAND.name} · {BRAND.tagline} · Enterprise L&D Platform
              </div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Structured Competency Mastery and Compliance Governance for Modern Teams
              </h1>
              <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                Equip employees and technical specialists with verified curricula,
                server-graded assessments, Training Needs Analysis (TNA), and
                tamper-evident certification records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/courses"
                className="px-6 py-3 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                Explore Course Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/certificates/verify"
                className="px-5 py-3 text-sm font-medium text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Verify a Certificate
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Governance & Architecture Preview Card */}
          <div className="lg:col-span-5 bg-[#102A4C] border border-slate-700/80 rounded-xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="text-xs text-blue-300 font-medium">
                Enterprise Security & Governance Standard
              </div>
              <h2 className="text-lg font-bold text-white">
                Administrator-Provisioned Access & Role Isolation
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Public learner self-registration is strictly disabled. Accounts are
                provisioned by authorized administrators with PostgreSQL Row-Level
                Security (RLS) and server-graded assessments.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-700/70 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">System Admin Profile:</span>{' '}
                  {BRAND.initialAdmin.fullName} ({BRAND.initialAdmin.email})
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Four Distinct Portals:</span>{' '}
                  Super Admin, Instructor, Organization Manager, and Learner
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Google Sheets Sync:</span>{' '}
                  Direct export of completion reports and TNA skill-gap matrices
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-700/70">
              <span className="text-slate-300 font-mono tabular-nums">
                Active Certs: {certificates.filter((c) => c.status === 'valid').length}
              </span>
              <Link
                href="/admin/dashboard"
                className="text-blue-300 font-semibold hover:text-white transition-colors"
              >
                Open Admin Console →
              </Link>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column KPI Strip Below Hero Split */}
        <div className="border-t border-slate-800 bg-[#08172C]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                {publishedCourses.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Published Enterprise Courses
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                {learningPaths.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Role-Based Learning Paths
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                100%
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Server-Validated Assessment Grading
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                {certificates.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Verifiable Digital Certificates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Searchable Course Discovery Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
              Published Course Catalog
            </h2>
            <p className="text-sm text-[#6B7280]">
              Search by topic, compliance requirement, or technical discipline. Only
              approved, published courses appear in public discovery.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search published courses"
              placeholder="Search courses by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Interactive Category Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F3F4F6] rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-white text-[#0B1F3A] shadow-2xs font-semibold'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            All Categories ({publishedCourses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#0B1F3A] shadow-2xs font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 border border-slate-200 rounded-xl text-center space-y-3 bg-[#F3F4F6]/50">
            <BookOpen className="w-8 h-8 text-[#6B7280] mx-auto" />
            <h3 className="text-base font-bold text-[#111827]">
              No matching published courses found
            </h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              Try clearing your search query or selecting a different subject category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const lessonCount = course.sections.reduce(
                (acc, s) => acc + s.lessons.length,
                0
              );
              return (
                <article
                  key={course.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <CourseVisual
                      theme={course.thumbnailTheme}
                      categoryName={course.categoryName}
                      className="h-40"
                    />
                    <div className="p-6 space-y-3">
                      {/* Clean unboxed metadata with typographic separators per frontend-design */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                        <span>{course.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{course.level}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {course.durationHours} hrs
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {lessonCount} lessons
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#111827] leading-snug">
                        <Link
                          href={`/courses/${course.slug}`}
                          className="hover:text-[#2563EB] transition-colors"
                        >
                          {course.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {course.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 bg-[#F3F4F6]/40 flex items-center justify-between gap-4 text-xs">
                    <div className="text-[#6B7280] truncate">
                      Instructor:{' '}
                      <span className="font-medium text-[#111827]">
                        {course.instructorName}
                      </span>
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-semibold text-[#2563EB] hover:underline whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                    >
                      View Curriculum <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Recommended Learning Paths & Corporate Training Needs Analysis (TNA) */}
      <section className="bg-[#F3F4F6] border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
                Structured Learning Paths & Corporate L&D Capabilities
              </h2>
              <p className="text-sm text-[#6B7280] max-w-2xl">
                Combine multi-course tracks with department-level Training Needs Analysis
                (TNA) to close skill gaps across engineering, security, and operations.
              </p>
            </div>
            <Link
              href="/learning-paths"
              className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
            >
              View All Learning Paths →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {learningPaths.map((lp, idx) => (
              <div
                key={lp.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="text-xs text-[#6B7280]">
                    <span>0{idx + 1}. Learning Path</span>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-mono tabular-nums">
                      {lp.estimatedHours} Hours Total
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#111827]">
                    {lp.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {lp.description}
                  </p>
                  <div className="text-xs text-[#111827]">
                    <strong>Target Audience:</strong> {lp.targetRole}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[#6B7280] font-mono tabular-nums">
                    {lp.courseIds.length} Required Courses
                  </span>
                  <Link
                    href={`/learning-paths/${lp.slug}`}
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Inspect Track →
                  </Link>
                </div>
              </div>
            ))}

            {/* Corporate TNA & Compliance Highlight Card */}
            <div className="bg-[#0B1F3A] text-white rounded-xl p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="text-xs text-blue-300">
                  03. Enterprise Competency Governance
                </div>
                <h3 className="text-base font-bold text-white">
                  Training Needs Analysis (TNA) & Google Sheets Reporting
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Assess employees on a transparent 1-to-5 competency scale, identify
                  critical skill gaps, assign mandatory training with due dates, and
                  sync reports directly to Google Sheets.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <Link
                  href="/organization/training-gaps"
                  className="font-semibold text-blue-300 hover:text-white transition-colors"
                >
                  Open TNA Matrix →
                </Link>
                <Link
                  href="/admin/reports"
                  className="font-semibold text-white hover:underline"
                >
                  Reports & Sheets Sync →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Enterprise Capabilities Summary */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>01. Zero Public Self-Registration</span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Only authorized Super Administrators can create learner or instructor
              accounts. Client-supplied role tampering is blocked on the server and in
              PostgreSQL RLS policies.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <span>02. Verifiable Digital Certificates</span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Certificates are generated only after server-verified 100% lesson
              completion and passing exam scores. Every certificate includes a unique
              verification code (e.g., LH-2026-0001).
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              <span>03. Separate Completion & Performance Metrics</span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Course completion percentages, server-graded assessment scores, and
              manager-assessed job competency levels are tracked and reported
              independently.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
