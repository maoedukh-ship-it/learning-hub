'use client';

import React from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { useHub } from '@/components/hub-context';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function PublicInstructorsPage() {
  const { users, courses } = useHub();
  const instructors = users.filter((u) => u.role === 'instructor');

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="text-xs text-blue-300 font-medium">
            Learning Hub · Subject-Matter Experts
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Authorized Faculty & Instructors
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Meet our industry practitioners leading enterprise cybersecurity,
            regulatory compliance, and distributed architecture instruction.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {instructors.map((inst) => {
          const authored = courses.filter(
            (c) => c.instructorId === inst.id && c.status === 'published'
          );
          return (
            <div
              key={inst.id}
              className="p-6 bg-white border border-slate-200 rounded-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-[#2563EB] font-semibold inline-flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> Authorized Instructor
                  </div>
                  <h2 className="text-lg font-bold text-[#111827] mt-1">
                    {inst.fullName}
                  </h2>
                  <p className="text-xs text-[#6B7280]">{inst.jobTitle}</p>
                </div>
                <span className="text-xs font-mono text-[#6B7280]">
                  {authored.length} Published Courses
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-semibold text-[#111827]">
                  Published Curricula:
                </div>
                {authored.map((c) => (
                  <Link
                    key={c.id}
                    href={`/courses/${c.slug}`}
                    className="block text-xs text-[#2563EB] hover:underline"
                  >
                    • {c.title} <ArrowRight className="w-3 h-3 inline" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PublicShell>
  );
}
