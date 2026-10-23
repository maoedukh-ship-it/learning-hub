'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BRAND, ROLE_HOME_ROUTES, ROLE_LABELS, UserRole } from '@/lib/brand';
import { canAccessPortalRoute } from '@/lib/lms-logic';
import { useHub } from './hub-context';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  FileCheck,
  Building2,
  BarChart3,
  ShieldAlert,
  Settings,
  Bell,
  Bookmark,
  GraduationCap,
  LogOut,
  Lock,
  Layers,
  ClipboardCheck,
  Compass,
  UserCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PORTAL_NAV: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Executive Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Provision Account', href: '/admin/users/new', icon: UserCircle },
    { label: 'Instructors', href: '/admin/instructors', icon: GraduationCap },
    { label: 'Course Management', href: '/admin/courses', icon: BookOpen },
    { label: 'Course Review Queue', href: '/admin/courses/review', icon: ClipboardCheck },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Learning Paths', href: '/admin/learning-paths', icon: Compass },
    { label: 'Assessments', href: '/admin/assessments', icon: FileCheck },
    { label: 'Certificates Registry', href: '/admin/certificates', icon: Award },
    { label: 'Organizations & Depts', href: '/admin/organizations', icon: Building2 },
    { label: 'Training Assignments', href: '/admin/training-assignments', icon: ClipboardCheck },
    { label: 'Reports & Sheets Sync', href: '/admin/reports', icon: BarChart3 },
    { label: 'TNA & Competency Gaps', href: '/admin/reports/training-gaps', icon: ShieldAlert },
    { label: 'Security Audit Logs', href: '/admin/audit-logs', icon: Lock },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
  ],
  instructor: [
    { label: 'Instructor Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/instructor/courses', icon: BookOpen },
    { label: 'Create New Course', href: '/instructor/courses/new', icon: Layers },
    { label: 'Assessments & Grading', href: '/instructor/assessments', icon: FileCheck },
    { label: 'Enrolled Learners', href: '/instructor/learners', icon: Users },
    { label: 'Course Analytics', href: '/instructor/analytics', icon: BarChart3 },
    { label: 'Instructor Profile', href: '/instructor/profile', icon: UserCircle },
  ],
  manager: [
    { label: 'Manager Dashboard', href: '/organization/dashboard', icon: LayoutDashboard },
    { label: 'Department Employees', href: '/organization/employees', icon: Users },
    { label: 'Departments', href: '/organization/departments', icon: Building2 },
    { label: 'Teams', href: '/organization/teams', icon: Layers },
    { label: 'Training Assignments', href: '/organization/assignments', icon: ClipboardCheck },
    { label: 'TNA & Competency Gaps', href: '/organization/training-gaps', icon: ShieldAlert },
    { label: 'Department Reports', href: '/organization/reports', icon: BarChart3 },
  ],
  learner: [
    { label: 'Learning Dashboard', href: '/learn/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/learn/my-courses', icon: BookOpen },
    { label: 'Assigned Training', href: '/learn/assigned-training', icon: ClipboardCheck },
    { label: 'Learning Paths', href: '/learn/learning-paths', icon: Compass },
    { label: 'Assessments & Exams', href: '/learn/assessments', icon: FileCheck },
    { label: 'Exam Results', href: '/learn/results', icon: BarChart3 },
    { label: 'My Certificates', href: '/learn/certificates', icon: Award },
    { label: 'Saved Bookmarks', href: '/learn/bookmarks', icon: Bookmark },
    { label: 'Notifications', href: '/learn/notifications', icon: Bell },
    { label: 'My Profile', href: '/learn/profile', icon: UserCircle },
    { label: 'Account Settings', href: '/learn/settings', icon: Settings },
  ],
};

export function PortalShell({
  portalTitle,
  requiredPortal,
  children,
}: {
  portalTitle: string;
  requiredPortal: UserRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, notifications, switchSession, logoutSession } = useHub();

  const access = canAccessPortalRoute(currentUser, pathname);
  const unreadCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.isRead
  ).length;

  const navItems = PORTAL_NAV[requiredPortal] || PORTAL_NAV.learner;

  if (!access.allowed) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8 space-y-5">
          <div className="flex items-center gap-3 text-red-700">
            <Lock className="w-6 h-6 shrink-0" />
            <h1 className="text-xl font-bold text-[#111827]">
              Protected Portal — Role Authorization Required
            </h1>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            {access.reason ||
              'You do not have permission to view this portal with your current session role.'}
          </p>
          <div className="p-4 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] space-y-1">
            <div>
              <strong>Requested Route:</strong>{' '}
              <span className="font-mono">{pathname}</span>
            </div>
            <div>
              <strong>Current Session:</strong>{' '}
              {currentUser
                ? `${currentUser.fullName} (${ROLE_LABELS[currentUser.role]})`
                : 'Unauthenticated Visitor'}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-[#6B7280]">
              Sign in with an authorized account for this portal:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => switchSession({ userId: 'user-admin-1' })}
                className="px-3.5 py-2 text-xs font-semibold bg-[#0B1F3A] text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign in as System Admin (Super Admin)
              </button>
              <button
                type="button"
                onClick={() => switchSession({ userId: 'user-inst-1' })}
                className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 text-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign in as Instructor
              </button>
              <button
                type="button"
                onClick={() => switchSession({ userId: 'user-mgr-1' })}
                className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 text-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign in as Org Manager
              </button>
              <button
                type="button"
                onClick={() => switchSession({ userId: 'user-learn-1' })}
                className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 text-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign in as Learner
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-[#2563EB] font-medium hover:underline"
            >
              Return to Public Homepage
            </Link>
            {currentUser && (
              <Link
                href={ROLE_HOME_ROUTES[currentUser.role]}
                className="text-[#111827] font-semibold hover:underline"
              >
                Go to My Authorized Dashboard →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F3F4F6] text-[#111827]">
      {/* Left Sidebar (260px width) */}
      <aside className="w-64 bg-[#0B1F3A] text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-white whitespace-nowrap"
          >
            {BRAND.name}
          </Link>
          <span className="text-[11px] text-slate-300 font-mono">
            {ROLE_LABELS[requiredPortal]}
          </span>
        </div>

        <nav
          aria-label="Portal Sidebar Navigation"
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== '/admin/reports' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Portal Role Switcher & Active Profile Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-[#08172C]">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser?.fullName}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {currentUser?.email}
            </div>
            <div className="text-[11px] text-blue-300 font-medium">
              Role: {currentUser ? ROLE_LABELS[currentUser.role] : ''}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <Link
              href="/courses"
              className="px-2.5 py-1.5 text-[11px] font-medium text-center text-slate-200 bg-slate-800 rounded hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              Public Catalog
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logoutSession();
                router.push('/login');
              }}
              className="px-2.5 py-1.5 text-[11px] font-medium text-center text-red-200 bg-red-950/60 rounded hover:bg-red-900/70 transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header per 3_saas_dashboard.md */}
        <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-[#6B7280] min-w-0">
            <Link href="/" className="hover:text-[#0B1F3A] font-medium">
              {BRAND.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#111827] truncate">
              {portalTitle}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Portal Switcher for Super Admin / Evaluators */}
            <div className="hidden xl:flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-lg text-xs">
              {[
                { id: 'user-admin-1', label: 'System Admin', href: '/admin/dashboard' },
                { id: 'user-inst-1', label: 'Instructor', href: '/instructor/dashboard' },
                { id: 'user-mgr-1', label: 'Org Manager', href: '/organization/dashboard' },
                { id: 'user-learn-1', label: 'Learner', href: '/learn/dashboard' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={async () => {
                    await switchSession({ userId: p.id });
                    router.push(p.href);
                  }}
                  className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                    currentUser?.id === p.id
                      ? 'bg-white text-[#0B1F3A] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Link
              href={
                currentUser?.role === 'super_admin'
                  ? '/admin/notifications'
                  : '/learn/notifications'
              }
              className="px-3 py-1.5 text-xs font-medium text-[#111827] bg-[#F3F4F6] rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Notifications ({unreadCount})
            </Link>

            <div className="relative group">
              <button
                type="button"
                aria-label={`Profile menu for ${currentUser?.fullName || 'User'}`}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap inline-flex items-center gap-2"
              >
                <UserCircle className="w-3.5 h-3.5 text-blue-300" />
                <span>{currentUser?.fullName}</span>
              </button>
              <div className="hidden group-hover:block group-focus-within:block absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-[#111827] truncate">
                    {currentUser?.fullName}
                  </div>
                  <div className="text-[11px] text-[#6B7280] font-mono truncate">
                    {currentUser?.email}
                  </div>
                </div>
                <Link
                  href={
                    currentUser?.role === 'super_admin'
                      ? '/admin/settings'
                      : currentUser?.role === 'instructor'
                      ? '/instructor/profile'
                      : '/learn/profile'
                  }
                  className="block px-3 py-2 text-[#111827] hover:bg-[#F3F4F6] rounded-lg font-medium mt-1"
                >
                  Profile & Account Settings
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutSession();
                    router.push('/login');
                  }}
                  className="w-full text-left px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Securely</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
