'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { useHub } from '@/components/hub-context';
import { ArrowRight } from 'lucide-react';

export default function LearningPathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { loading, learningPaths, courses } = useHub();

  const lp =
    learningPaths.find((p) => p.slug === slug || p.id === slug) ||
    learningPaths[0];

  if (loading || !lp) {
    return (
      <PublicShell>
        <div className="max-w-5xl mx-auto px-6 py-16 text-xs text-[#6B7280]">
          Loading learning path roadmap...
        </div>
      </PublicShell>
    );
  }

  const pathCourses = lp.courseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="text-xs text-blue-300">
            <Link href="/learning-paths" className="hover:underline">
              Learning Paths
            </Link>{' '}
            · {lp.estimatedHours} Hours Total
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{lp.title}</h1>
          <p className="text-sm text-slate-300 max-w-2xl">{lp.description}</p>
          <div className="text-xs text-slate-300">
            Target Role: <strong className="text-white">{lp.targetRole}</strong>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12 space-y-6">
        <h2 className="text-lg font-bold text-[#111827]">
          Sequential Course Milestones
        </h2>
        <div className="space-y-4">
          {pathCourses.map((course, idx) => (
            <div
              key={course!.id}
              className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="text-xs text-[#6B7280] font-mono">
                  Milestone 0{idx + 1} · {course!.level} · {course!.durationHours}{' '}
                  Hours
                </div>
                <h3 className="text-base font-bold text-[#111827]">
                  {course!.title}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {course!.shortDescription}
                </p>
              </div>
              <Link
                href={`/courses/${course!.slug}`}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
              >
                View Course <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
