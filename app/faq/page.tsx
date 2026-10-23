'use client';

import React from 'react';
import { PublicShell } from '@/components/public-shell';
import { BRAND } from '@/lib/brand';

export default function FAQPage() {
  const faqs = [
    {
      q: 'Why is there no public learner sign-up button?',
      a: 'Per Learning Hub enterprise security policy, public self-registration is strictly disabled. Learner, instructor, and manager accounts are provisioned exclusively by authorized Super Administrators.',
    },
    {
      q: 'How are digital certificates verified?',
      a: 'Every certificate is assigned a unique identifier (such as LH-2026-0001) upon server-verified 100% lesson completion and passing exam score. Anyone can verify authenticity at /certificates/verify.',
    },
    {
      q: 'Does completing a course automatically increase my TNA job competency score?',
      a: 'No. Learning Hub reports course completion, assessment scores, and manager-evaluated job competency levels separately to maintain objective Training Needs Analysis (TNA).',
    },
  ];

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-300">
            Common questions about {BRAND.name} enrollment, security, and
            certification.
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border border-slate-200 rounded-xl space-y-2"
          >
            <h2 className="text-sm font-bold text-[#111827]">{item.q}</h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </PublicShell>
  );
}
