'use client';

import React, { useState } from 'react';
import { PublicShell } from '@/components/public-shell';
import { BRAND } from '@/lib/brand';
import { CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="text-xs text-blue-300">{BRAND.tagline}</div>
          <h1 className="text-3xl font-bold tracking-tight">
            About {BRAND.name}
          </h1>
          <p className="text-sm text-slate-300">{BRAND.description}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-6 text-sm text-[#111827] leading-relaxed">
        <p>
          <strong>{BRAND.name}</strong> is an enterprise learning management and
          competency governance platform engineered for both individual skill
          development and corporate employee training.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 bg-[#F3F4F6] rounded-xl space-y-2">
            <h2 className="text-base font-bold text-[#111827]">
              Role-Based Security Architecture
            </h2>
            <p className="text-xs text-[#6B7280]">
              Public self-registration is disabled. Every account is provisioned by
              authorized administrators (`{BRAND.initialAdmin.email}`) with strict
              server-side RBAC and PostgreSQL Row-Level Security.
            </p>
          </div>
          <div className="p-6 bg-[#F3F4F6] rounded-xl space-y-2">
            <h2 className="text-base font-bold text-[#111827]">
              Training Needs Analysis (TNA)
            </h2>
            <p className="text-xs text-[#6B7280]">
              Managers evaluate job competencies on a transparent 1-to-5 scale,
              separate course completion from on-the-job performance, and sync
              reports directly to Google Sheets.
            </p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
