'use client';

import React from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { useHub } from '@/components/hub-context';
import { ArrowRight, Compass } from 'lucide-react';

export default function LearningPathsPage() {
  const { learningPaths, courses } = useHub();

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="text-xs text-blue-300 font-medium">
            Learning Hub · Multi-Course Curricula
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Structured Learning Paths
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Guided, sequential learning programs tailored to enterprise job roles and
            competency milestones.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningPaths.map((lp, idx) => {
          const pathCourses = lp.courseIds
            .map((id) => courses.find((c) => c.id === id))
            .filter(Boolean);

          return (
            <div
              key={lp.id}
              className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#2563EB]">
                    <Compass className="w-4 h-4" /> Track 0{idx + 1}
                  </span>
                  <span className="font-mono tabular-nums">
                    {lp.estimatedHours} Hours · {pathCourses.length} Courses
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#111827]">{lp.title}</h2>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {lp.description}
                </p>
                <div className="text-xs text-[#111827]">
                  <strong>Target Role:</strong> {lp.targetRole}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="text-xs font-semibold text-[#111827]">
                    Included Courses:
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#6B7280]">
                    {pathCourses.map((c, cIdx) => (
                      <li key={c!.id}>
                        Step {cIdx + 1}:{' '}
                        <Link
                          href={`/courses/${c!.slug}`}
                          className="text-[#111827] font-medium hover:text-[#2563EB] hover:underline"
                        >
                          {c!.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/learning-paths/${lp.slug}`}
                  className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                >
                  Open Learning Path Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </PublicShell>
  );
}
