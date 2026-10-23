'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BRAND, ROLE_HOME_ROUTES, ROLE_LABELS } from '@/lib/brand';
import { useHub } from './hub-context';
import { Shield, LogOut, UserCheck, ArrowRight } from 'lucide-react';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { currentUser, users, switchSession, logoutSession } = useHub();
  const router = useRouter();

  const portalHref = currentUser
    ? ROLE_HOME_ROUTES[currentUser.role]
    : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      {/* Strictly 3-Zone Top Bar Contract per frontend-design */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-200 bg-white sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-[#0B1F3A] whitespace-nowrap shrink-0"
        >
          {BRAND.name}
        </Link>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6B7280]"
        >
          <Link
            href="/courses"
            className="hover:text-[#0B1F3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Courses
          </Link>
          <Link
            href="/categories"
            className="hover:text-[#0B1F3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Categories
          </Link>
          <Link
            href="/learning-paths"
            className="hover:text-[#0B1F3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Learning Paths
          </Link>
          <Link
            href="/instructors"
            className="hover:text-[#0B1F3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Instructors
          </Link>
          <Link
            href="/certificates/verify"
            className="hover:text-[#0B1F3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Verify Certificate
          </Link>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <Link
            href={portalHref}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
          >
            {currentUser ? `Open ${ROLE_LABELS[currentUser.role]} Portal` : 'Sign In'}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Workspace Role Switcher Toolbar (Below content, non-sticky) */}
      <section
        aria-label="Role Session Switcher"
        className="border-t border-slate-200 bg-[#F3F4F6] px-6 lg:px-12 py-4"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#111827]">
            <Shield className="w-4 h-4 text-[#2563EB]" />
            <span className="font-semibold">Active Session Identity:</span>
            {currentUser ? (
              <span className="text-[#111827]">
                {currentUser.fullName} · {currentUser.email} ·{' '}
                {ROLE_LABELS[currentUser.role]}
              </span>
            ) : (
              <span className="text-[#6B7280]">Anonymous Visitor (Not Signed In)</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#6B7280] mr-1">Switch Role View:</span>
            {[
              { id: 'user-admin-1', label: 'System Admin (Super Admin)' },
              { id: 'user-inst-1', label: 'Dr. Sophea Vann (Instructor)' },
              { id: 'user-mgr-1', label: 'Nary Pich (Org Manager)' },
              { id: 'user-learn-1', label: 'Dara Kem (Learner)' },
            ].map((preset) => {
              const isActive = currentUser?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={async () => {
                    const res = await switchSession({ userId: preset.id });
                    if (res.ok && res.user) {
                      router.push(ROLE_HOME_ROUTES[res.user.role]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-white text-[#111827] border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 inline mr-1.5" />
                  {preset.label}
                </button>
              );
            })}
            {currentUser && (
              <button
                type="button"
                onClick={() => logoutSession()}
                className="px-3 py-1.5 rounded-md font-medium bg-white text-red-700 border border-red-200 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 inline mr-1" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quiet Enterprise Footer */}
      <footer className="bg-[#0B1F3A] text-white px-6 lg:px-12 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          <div className="space-y-3">
            <div className="text-lg font-bold tracking-tight text-white">
              {BRAND.name}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {BRAND.tagline} — Enterprise Learning Management System & Corporate
              Competency Governance.
            </p>
            <p className="text-xs text-slate-400">
              Public learner self-registration is disabled. Accounts are provisioned
              exclusively by authorized administrators.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-3">
              Discovery & Catalog
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Subject Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/learning-paths"
                  className="hover:text-white transition-colors"
                >
                  Learning Paths
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="hover:text-white transition-colors">
                  Faculty & Subject-Matter Experts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-3">
              Role Portals
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  href="/learn/dashboard"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Learner Portal <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/instructor/dashboard"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Instructor Studio <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/organization/dashboard"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Organization & TNA Portal <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Super Admin Console <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-3">
              Governance & Support
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  href="/certificates/verify"
                  className="hover:text-white transition-colors"
                >
                  Certificate Verification
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Learning Hub
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact L&D Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
          <div>
            Initial System Admin: {BRAND.initialAdmin.fullName} ({BRAND.initialAdmin.email})
          </div>
        </div>
      </footer>
    </div>
  );
}
