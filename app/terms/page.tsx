'use client';

import React from 'react';
import { PublicShell } from '@/components/public-shell';
import { BRAND } from '@/lib/brand';

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-300">
            {BRAND.name} Acceptable Use & Academic Integrity Policy
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-4 text-xs text-[#6B7280] leading-relaxed">
        <p>
          <strong className="text-[#111827]">1. Authorized Access Only:</strong>{' '}
          Access to {BRAND.name} portals is restricted to accounts provisioned by
          authorized administrators. Attempting to bypass role boundaries or elevate
          privileges is logged in the security audit trail.
        </p>
        <p>
          <strong className="text-[#111827]">2. Assessment Integrity:</strong>{' '}
          Examinations must be completed independently by the assigned learner within
          configured attempt limits. Certificates may be revoked by the Super
          Administrator if compliance policies are violated.
        </p>
      </div>
    </PublicShell>
  );
}
