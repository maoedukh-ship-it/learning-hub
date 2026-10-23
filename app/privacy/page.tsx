'use client';

import React from 'react';
import { PublicShell } from '@/components/public-shell';
import { BRAND } from '@/lib/brand';

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-300">
            {BRAND.name} Employee & Learner Data Protection Standard
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-4 text-xs text-[#6B7280] leading-relaxed">
        <p>
          <strong className="text-[#111827]">1. Tenant & Learner Isolation:</strong>{' '}
          All learner progress, assessment attempts, certificates, and Training Needs
          Analysis (TNA) records are protected by server-side Role-Based Access
          Control and PostgreSQL Row-Level Security (RLS).
        </p>
        <p>
          <strong className="text-[#111827]">2. Credential Hygiene:</strong>{' '}
          Privileged API keys and service-role secrets are strictly isolated on the
          server. OAuth tokens for Google Sheets reporting are cached exclusively in
          volatile memory and cleared upon sign-out.
        </p>
      </div>
    </PublicShell>
  );
}
