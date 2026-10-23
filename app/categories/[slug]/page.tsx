'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { CourseVisual } from '@/components/course-visual';
import { useHub } from '@/components/hub-context';
import { ArrowRight } from 'lucide-react';

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { categories, courses } = useHub();

  const category = categories.find((c) => c.slug === slug || c.id === slug);
  const categoryCourses = courses.filter(
    (c) =>
      c.status === 'published' &&
      (c.categoryId === category?.id || c.categoryName.toLowerCase().includes(slug))
  );

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="text-xs text-blue-300">
            <Link href="/categories" className="hover:underline">
              Categories
            </Link>{' '}
            · {category?.name || slug}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {category?.name || 'Category Courses'}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            {category?.description || 'Published courses within this domain.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoryCourses.map((course) => (
          <article
            key={course.id}
            className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between"
          >
            <div>
              <CourseVisual
                theme={course.thumbnailTheme}
                categoryName={course.categoryName}
                className="h-36"
              />
              <div className="p-6 space-y-2">
                <div className="text-xs text-[#6B7280]">
                  {course.level} ·{' '}
                  <span className="font-mono">{course.durationHours} Hours</span>
                </div>
                <h2 className="text-lg font-bold text-[#111827]">
                  <Link href={`/courses/${course.slug}`} className="hover:text-[#2563EB]">
                    {course.title}
                  </Link>
                </h2>
                <p className="text-xs text-[#6B7280]">{course.shortDescription}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[#6B7280]">By {course.instructorName}</span>
              <Link
                href={`/courses/${course.slug}`}
                className="font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
              >
                Open Course <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PublicShell>
  );
}
