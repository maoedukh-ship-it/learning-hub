'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { BRAND } from '@/lib/brand';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Requirement 5.16: Avoid revealing whether an arbitrary email address has an account
    setSubmitted(true);
  };

  return (
    <PublicShell>
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#2563EB]">
              {BRAND.name} · Account Recovery
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Reset Your Password
            </h1>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Enter your corporate email address. To protect user privacy and prevent
              account enumeration, the same confirmation message is shown regardless of
              whether an account exists.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Recovery Instructions Queued</span>
              </div>
              <p>
                If an active administrator-provisioned account matches{' '}
                <span className="font-mono">{email}</span>, password reset
                instructions have been recorded. You may also contact{' '}
                <span className="font-mono">{BRAND.supportEmail}</span> for
                supervised reset.
              </p>
              <Link
                href="/reset-password"
                className="inline-block font-semibold text-[#2563EB] hover:underline pt-1"
              >
                Proceed to Password Reset Form →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="recovery-email"
                  className="block text-xs font-semibold text-[#111827]"
                >
                  Corporate Email Address
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@wing-shop.com"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg text-[#111827]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Password Reset
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-200">
            <Link
              href="/login"
              className="text-xs font-medium text-[#6B7280] hover:text-[#111827] inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
