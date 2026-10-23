'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { CourseVisual } from '@/components/course-visual';
import { useHub } from '@/components/hub-context';
import { Search, ArrowRight, BookOpen } from 'lucide-react';

export default function CoursesCatalogPage() {
  const { courses, categories } = useHub();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'duration'>('relevance');

  const publishedCourses = useMemo(
    () => courses.filter((c) => c.status === 'published'),
    [courses]
  );

  const filtered = useMemo(() => {
    const list = publishedCourses.filter((c) => {
      const matchCat = categoryFilter === 'all' || c.categoryId === categoryFilter;
      const matchLevel = levelFilter === 'all' || c.level === levelFilter;
      const q = search.trim().toLowerCase();
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q);
      return matchCat && matchLevel && matchQuery;
    });

    if (sortBy === 'newest') {
      return [...list].sort((a, b) =>
        (b.publishedAt || '').localeCompare(a.publishedAt || '')
      );
    }
    if (sortBy === 'duration') {
      return [...list].sort((a, b) => a.durationHours - b.durationHours);
    }
    return list;
  }, [publishedCourses, categoryFilter, levelFilter, search, sortBy]);

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="text-xs text-blue-300 font-medium">
            Learning Hub · Public Course Discovery
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Published Enterprise Course Catalog
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Browse verified courses across cybersecurity, regulatory compliance,
            distributed data engineering, and leadership.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
        {/* Search, Filter & Sort Toolbar */}
        <div className="p-5 bg-[#F3F4F6] border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search catalog"
              placeholder="Search by title, keyword, or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg text-[#111827]"
            />
          </div>

          <div>
            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-[#111827]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              aria-label="Filter by difficulty level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-1/2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-[#111827]"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              aria-label="Sort courses"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'relevance' | 'newest' | 'duration')
              }
              className="w-1/2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-[#111827]"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="newest">Sort: Newest</option>
              <option value="duration">Sort: Duration</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span>
            Showing <strong className="text-[#111827] font-mono">{filtered.length}</strong>{' '}
            of {publishedCourses.length} published courses
          </span>
          {(search || categoryFilter !== 'all' || levelFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setLevelFilter('all');
              }}
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 border border-slate-200 rounded-xl text-center space-y-3">
            <BookOpen className="w-8 h-8 text-[#6B7280] mx-auto" />
            <h2 className="text-base font-bold text-[#111827]">
              No courses match your current filters
            </h2>
            <p className="text-xs text-[#6B7280]">
              Adjust your search keywords or level filter to view available courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((course) => {
              const lessonCount = course.sections.reduce(
                (sum, s) => sum + s.lessons.length,
                0
              );
              return (
                <article
                  key={course.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between"
                >
                  <div>
                    <CourseVisual
                      theme={course.thumbnailTheme}
                      categoryName={course.categoryName}
                      className="h-40"
                    />
                    <div className="p-6 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                        <span>{course.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{course.level}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {course.durationHours} Hours
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {lessonCount} Lessons
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{course.language}</span>
                      </div>
                      <h2 className="text-lg font-bold text-[#111827]">
                        <Link
                          href={`/courses/${course.slug}`}
                          className="hover:text-[#2563EB] transition-colors"
                        >
                          {course.title}
                        </Link>
                      </h2>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {course.shortDescription}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 bg-[#F3F4F6]/40 flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">
                      Instructor:{' '}
                      <strong className="text-[#111827]">
                        {course.instructorName}
                      </strong>
                    </span>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                    >
                      Course Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
