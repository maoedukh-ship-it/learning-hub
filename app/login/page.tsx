'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicShell } from '@/components/public-shell';
import { useHub } from '@/components/hub-context';
import { BRAND, ROLE_HOME_ROUTES, ROLE_LABELS } from '@/lib/brand';
import { ShieldAlert, Lock, UserCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { users, currentUser, switchSession, connectGoogleSheets, googleEmail } =
    useHub();
  const [email, setEmail] = useState<string>(BRAND.initialAdmin.email);
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await switchSession({ email });
      if (!res.ok || !res.user) {
        // Generic error message to avoid account enumeration per Requirement 5.16
        setError(
          'Invalid login credentials or inactive account. Please contact your system administrator.'
        );
      } else {
        router.push(ROLE_HOME_ROUTES[res.user.role]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Enterprise Login Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#2563EB]">
              {BRAND.name} · Authenticated Portal Access
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[#6B7280]">
              Enter your administrator-provisioned corporate email address to access
              your portal.
            </p>
          </div>

          {/* Public Registration Disabled Notice per Section 5 */}
          <div className="p-4 bg-[#F3F4F6] border border-slate-200 rounded-lg flex items-start gap-3 text-xs text-[#111827]">
            <ShieldAlert className="w-4 h-4 text-[#0B1F3A] shrink-0 mt-0.5" />
            <div>
              <strong>Public Learner Registration Disabled:</strong> Only authorized
              Super Administrators may provision learner, instructor, or manager
              accounts. Self-registration is blocked at both the application and API
              levels.
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#111827]"
              >
                Email / Login Identifier
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg text-[#111827]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="login-password"
                  className="font-semibold text-[#111827]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg text-[#111827]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              {submitting ? 'Authenticating...' : 'Sign In to Learning Hub'}
            </button>
          </form>

          {/* Google Workspace Sign-In for Google Sheets Integration */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="text-xs font-semibold text-[#111827]">
              Google Workspace Integration (For Google Sheets Reporting)
            </div>
            {googleEmail ? (
              <div className="flex items-center gap-2 text-xs text-[#16A34A] font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Connected to Google Sheets as {googleEmail}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => connectGoogleSheets()}
                className="gsi-material-button w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-[#111827] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4 block"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: One-Click Provisioned Role Accounts for Evaluation */}
        <div className="lg:col-span-5 bg-[#F3F4F6] border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#111827]">
              Provisioned Enterprise Accounts
            </h2>
            <p className="text-xs text-[#6B7280]">
              Select any provisioned account below to test role-specific portals and
              RBAC permissions immediately:
            </p>
          </div>

          <div className="space-y-2.5">
            {users.slice(0, 5).map((u) => {
              const isCurrent = currentUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#111827] truncate">
                      {u.fullName}
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-mono truncate">
                      {u.email}
                    </div>
                    <div className="text-[11px] text-[#2563EB] font-medium">
                      {ROLE_LABELS[u.role]} · {u.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await switchSession({ userId: u.id });
                      if (res.ok && res.user) {
                        router.push(ROLE_HOME_ROUTES[res.user.role]);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      isCurrent
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#0B1F3A] text-white hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                    {isCurrent ? 'Open Portal' : 'Sign In As'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
