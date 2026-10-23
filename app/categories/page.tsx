'use client';

import React from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { useHub } from '@/components/hub-context';
import { ArrowRight, Layers } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, courses } = useHub();

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="text-xs text-blue-300 font-medium">
            Learning Hub · Curriculum Taxonomy
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Course Categories</h1>
          <p className="text-sm text-slate-300">
            Explore enterprise training domains organized by functional discipline.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const count = courses.filter(
            (c) => c.status === 'published' && c.categoryId === cat.id
          ).length;
          return (
            <div
              key={cat.id}
              className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#2563EB]">
                    <Layers className="w-4 h-4" /> Subject Domain
                  </span>
                  <span className="font-mono tabular-nums">
                    {count} Published Course(s)
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#111827]">{cat.name}</h2>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                >
                  Browse {cat.name} Courses <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </PublicShell>
  );
}
