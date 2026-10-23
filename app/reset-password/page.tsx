'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
import { CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPass.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Password confirmation does not match.');
      return;
    }
    setDone(true);
  };

  return (
    <PublicShell>
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#111827]">
              Set New Account Password
            </h1>
            <p className="text-xs text-[#6B7280]">
              Minimum 12 characters required by Learning Hub enterprise security policy.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              {error}
            </div>
          )}

          {done ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Password Updated</span>
              </div>
              <p>Your account password has been updated securely.</p>
              <Link
                href="/login"
                className="inline-block px-4 py-2 font-semibold text-white bg-[#0B1F3A] rounded-lg"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="new-pass"
                  className="block text-xs font-semibold text-[#111827]"
                >
                  New Password
                </label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-pass"
                  className="block text-xs font-semibold text-[#111827]"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-pass"
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
