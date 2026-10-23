'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { GoogleSheetsPanel } from '@/components/google-sheets-panel';
import { useHub } from '@/components/hub-context';
import { BRAND, ROLE_LABELS, UserRole } from '@/lib/brand';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  UserPlus,
  ShieldAlert,
  Lock,
} from 'lucide-react';

export default function AdminPortalCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = use(params);
  const section = slug?.[0] || 'dashboard';
  const subSection = slug?.[1];

  const {
    users,
    courses,
    categories,
    learningPaths,
    assessments,
    assessmentAttempts,
    enrollments,
    certificates,
    organizations,
    departments,
    tnaRecords,
    auditLogs,
    notifications,
    platformSettings,
    adminCreateUser,
    adminToggleUserStatus,
    adminAssignTraining,
    moderateCourse,
    revokeCertificate,
    createTNARecord,
  } = useHub();

  // State for creating a new user (/admin/users or /admin/users/new)
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('learner');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('dept-eng');
  const [newJobTitle, setNewJobTitle] = useState('Software Engineer');
  const [userSearch, setUserSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State for mandatory training assignment
  const [assignUserId, setAssignUserId] = useState('user-learn-1');
  const [assignCourseId, setAssignCourseId] = useState('course-comp-201');
  const [assignDueDate, setAssignDueDate] = useState('2026-11-30');

  // State for TNA Creation
  const [tnaEmpId, setTnaEmpId] = useState('user-learn-2');
  const [tnaCompName, setTnaCompName] = useState(
    'Zero-Trust Cloud Security & IAM Governance'
  );
  const [tnaExpected, setTnaExpected] = useState(5);
  const [tnaCurrent, setTnaCurrent] = useState(2);
  const [tnaCourseId, setTnaCourseId] = useState('course-cyber-101');

  // Confirmation modal for destructive admin actions
  const [confirmSuspendUser, setConfirmSuspendUser] = useState<{
    id: string;
    name: string;
    currentStatus: string;
  } | null>(null);
  const [confirmRevokeCert, setConfirmRevokeCert] = useState<{
    id: string;
    number: string;
    learner: string;
  } | null>(null);

  // Real calculated metrics per Section 13
  const activeLearners = users.filter(
    (u) => u.role === 'learner' && u.status === 'active'
  ).length;
  const totalInstructors = users.filter((u) => u.role === 'instructor').length;
  const publishedCoursesCount = courses.filter(
    (c) => c.status === 'published'
  ).length;
  const pendingReviewCourses = courses.filter(
    (c) => c.status === 'pending_review'
  );
  const completedEnrollments = enrollments.filter(
    (e) => e.status === 'completed'
  ).length;
  const completionRate =
    enrollments.length > 0
      ? Math.round((completedEnrollments / enrollments.length) * 100)
      : 0;
  const overdueEnrollments = enrollments.filter(
    (e) => e.dueDate && e.status !== 'completed' && e.dueDate < '2026-10-22'
  );
  const passedAttempts = assessmentAttempts.filter((a) => a.passed).length;
  const passRate =
    assessmentAttempts.length > 0
      ? Math.round((passedAttempts / assessmentAttempts.length) * 100)
      : 100;

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    const res = await adminCreateUser({
      fullName: newFullName,
      email: newEmail,
      role: newRole,
      employeeId: newEmployeeId,
      departmentId: newDepartmentId,
      organizationId: 'org-wing-1',
      jobTitle: newJobTitle,
    });
    if (!res.ok) {
      setErrorMsg(res.error || 'Failed to provision user.');
    } else {
      setFeedback(
        `Provisioned ${ROLE_LABELS[newRole]} account for ${newFullName} (${newEmail}) and recorded in audit log.`
      );
      setNewFullName('');
      setNewEmail('');
      setNewEmployeeId('');
    }
  };

  const handleAssignTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    const res = await adminAssignTraining({
      userId: assignUserId,
      courseId: assignCourseId,
      dueDate: assignDueDate,
      isMandatory: true,
    });
    if (!res.ok) {
      setErrorMsg(res.error || 'Failed to assign training.');
    } else {
      setFeedback('Mandatory training assigned and learner notification dispatched.');
    }
  };

  const handleCreateTNA = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    const res = await createTNARecord({
      employeeId: tnaEmpId,
      competencyName: tnaCompName,
      expectedLevel: tnaExpected,
      currentLevel: tnaCurrent,
      recommendedCourseId: tnaCourseId,
      reviewDate: '2026-12-01',
    });
    if (!res.ok) {
      setErrorMsg(res.error || 'Failed to create TNA record.');
    } else {
      setFeedback('Training Needs Analysis (TNA) competency gap recorded.');
    }
  };

  const downloadCSVReport = () => {
    const headers = [
      'Learner Name',
      'Email',
      'Employee ID',
      'Course Title',
      'Status',
      'Progress (%)',
      'Assessment Passed',
      'Due Date',
    ];
    const rows = enrollments.map((e) => {
      const u = users.find((user) => user.id === e.userId);
      const c = courses.find((course) => course.id === e.courseId);
      return [
        `"${u?.fullName || ''}"`,
        `"${u?.email || ''}"`,
        `"${u?.employeeId || ''}"`,
        `"${c?.title || ''}"`,
        e.status,
        e.progressPercent,
        e.assessmentPassed ? 'Yes' : 'No',
        e.dueDate || 'Optional',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-hub-training-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.employeeId || '').toLowerCase().includes(q)
    );
  });

  return (
    <PortalShell
      portalTitle={`Super Admin Console — ${section.toUpperCase()}${
        subSection ? ` / ${subSection.toUpperCase()}` : ''
      }`}
      requiredPortal="super_admin"
    >
      <div className="space-y-8">
        {/* Feedback & Error Alerts */}
        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Destructive Action Confirmation Dialogs */}
        {confirmSuspendUser && (
          <div
            role="dialog"
            aria-modal="true"
            className="p-5 bg-white border-2 border-[#0B1F3A] rounded-xl space-y-3"
          >
            <h3 className="text-sm font-bold text-[#111827]">
              Confirm Account Status Change
            </h3>
            <p className="text-xs text-[#6B7280]">
              Are you sure you want to{' '}
              {confirmSuspendUser.currentStatus === 'active'
                ? 'suspend'
                : 'reactivate'}{' '}
              the account for <strong>{confirmSuspendUser.name}</strong>? This action
              will be recorded in the security audit log.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await adminToggleUserStatus(confirmSuspendUser.id);
                  setConfirmSuspendUser(null);
                  setFeedback(
                    `Updated account status for ${confirmSuspendUser.name}.`
                  );
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] rounded-lg"
              >
                Confirm Status Change
              </button>
              <button
                type="button"
                onClick={() => setConfirmSuspendUser(null)}
                className="px-4 py-2 text-xs font-medium border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {confirmRevokeCert && (
          <div
            role="dialog"
            aria-modal="true"
            className="p-5 bg-white border-2 border-[#DC2626] rounded-xl space-y-3"
          >
            <h3 className="text-sm font-bold text-[#111827]">
              Confirm Certificate Revocation
            </h3>
            <p className="text-xs text-[#6B7280]">
              Are you sure you want to revoke certificate{' '}
              <span className="font-mono font-bold">{confirmRevokeCert.number}</span>{' '}
              issued to <strong>{confirmRevokeCert.learner}</strong>? Public
              verification will immediately report this credential as revoked.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await revokeCertificate(
                    confirmRevokeCert.id,
                    'Revoked by System Admin via compliance review'
                  );
                  setConfirmRevokeCert(null);
                  setFeedback(
                    `Certificate ${confirmRevokeCert.number} has been revoked.`
                  );
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] rounded-lg"
              >
                Confirm Revocation
              </button>
              <button
                type="button"
                onClick={() => setConfirmRevokeCert(null)}
                className="px-4 py-2 text-xs font-medium border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Executive KPI Grid (Always visible on dashboard & reports) */}
        {(section === 'dashboard' || section === 'reports') && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <div className="text-xs text-[#6B7280]">Active Learners</div>
              <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums mt-1">
                {activeLearners}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Total Users: {users.length} · Instructors: {totalInstructors}
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <div className="text-xs text-[#6B7280]">
                Published Courses & Enrollments
              </div>
              <div className="text-2xl font-bold text-[#2563EB] font-mono tabular-nums mt-1">
                {publishedCoursesCount} / {enrollments.length}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Pending Review: {pendingReviewCourses.length}
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <div className="text-xs text-[#6B7280]">
                Completion & Exam Pass Rate
              </div>
              <div className="text-2xl font-bold text-[#16A34A] font-mono tabular-nums mt-1">
                {completionRate}% / {passRate}%
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Certificates Issued: {certificates.length}
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <div className="text-xs text-[#6B7280]">
                Overdue Mandatory Training
              </div>
              <div className="text-2xl font-bold text-[#DC2626] font-mono tabular-nums mt-1">
                {overdueEnrollments.length}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Active TNA Gaps: {tnaRecords.length}
              </div>
            </div>
          </div>
        )}

        {/* 1. User Management & Provisioning (/admin/users, /admin/users/new, /admin/dashboard) */}
        {(section === 'dashboard' ||
          section === 'users' ||
          section === 'instructors') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Provision New Account Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                  <UserPlus className="w-4 h-4 text-[#2563EB]" />
                  <span>Provision New Account (Admin Only)</span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Public self-registration is disabled. Create learner, instructor, or
                  manager accounts securely on the server.
                </p>
              </div>

              <form onSubmit={handleProvisionUser} className="space-y-3.5 text-xs">
                <div>
                  <label
                    htmlFor="prov-fullname"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="prov-fullname"
                    type="text"
                    required
                    placeholder="e.g., Sokha Chan"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prov-email"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Corporate Email Address
                  </label>
                  <input
                    id="prov-email"
                    type="email"
                    required
                    placeholder="sokha.chan@wing-shop.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="prov-role"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Authorization Role
                    </label>
                    <select
                      id="prov-role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="learner">Learner</option>
                      <option value="instructor">Instructor</option>
                      <option value="manager">Organization Manager</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="prov-empid"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Employee ID (Optional)
                    </label>
                    <input
                      id="prov-empid"
                      type="text"
                      placeholder="EMP-2026-205"
                      value={newEmployeeId}
                      onChange={(e) => setNewEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="prov-dept"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Department
                    </label>
                    <select
                      id="prov-dept"
                      value={newDepartmentId}
                      onChange={(e) => setNewDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="prov-title"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Job Role / Title
                    </label>
                    <input
                      id="prov-title"
                      type="text"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Provision Account & Log Audit Entry
                </button>
              </form>
            </div>

            {/* User Roster Table */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">
                    Provisioned Accounts Directory ({filteredUsers.length})
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Separate Full Name, Login Identifier, and Role fields enforced.
                  </p>
                </div>
                <input
                  type="search"
                  aria-label="Filter users"
                  placeholder="Search name, email, ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[#6B7280]">
                      <th className="py-2.5 pr-3">Full Name</th>
                      <th className="py-2.5 pr-3">Login Identifier</th>
                      <th className="py-2.5 pr-3">Role</th>
                      <th className="py-2.5 pr-3">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers
                      .filter((u) =>
                        section === 'instructors' ? u.role === 'instructor' : true
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 pr-3 font-semibold text-[#111827]">
                            {u.fullName}
                            <div className="text-[11px] font-normal text-[#6B7280]">
                              {u.jobTitle}
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-[#111827] whitespace-nowrap">
                            {u.email}
                          </td>
                          <td className="py-2.5 pr-3 font-medium text-[#2563EB] whitespace-nowrap">
                            {ROLE_LABELS[u.role]}
                          </td>
                          <td className="py-2.5 pr-3 whitespace-nowrap">
                            <span
                              className={
                                u.status === 'active'
                                  ? 'text-[#16A34A] font-semibold'
                                  : 'text-red-700 font-semibold'
                              }
                            >
                              {u.status === 'active' ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {u.email !== BRAND.initialAdmin.email && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmSuspendUser({
                                    id: u.id,
                                    name: u.fullName,
                                    currentStatus: u.status,
                                  })
                                }
                                className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] underline"
                              >
                                {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Course Management & Moderation Queue (/admin/courses, /admin/courses/review) */}
        {(section === 'dashboard' || section === 'courses') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Course Governance & Moderation Queue
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Approve courses submitted by instructors for publication or archive
                  outdated curricula.
                </p>
              </div>
              <Link
                href="/instructor/courses/new"
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800"
              >
                + Create Course
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[#6B7280]">
                    <th className="py-2.5 pr-3">Course Title</th>
                    <th className="py-2.5 pr-3">Category</th>
                    <th className="py-2.5 pr-3">Instructor</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 pr-3 font-bold text-[#111827]">
                        <Link
                          href={`/courses/${c.slug}`}
                          className="hover:text-[#2563EB]"
                        >
                          {c.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-[#6B7280]">
                        {c.categoryName}
                      </td>
                      <td className="py-3 pr-3 text-[#111827]">
                        {c.instructorName}
                      </td>
                      <td className="py-3 pr-3 font-mono font-semibold">
                        <span
                          className={
                            c.status === 'published'
                              ? 'text-[#16A34A]'
                              : c.status === 'pending_review'
                              ? 'text-[#D97706]'
                              : 'text-[#6B7280]'
                          }
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2 whitespace-nowrap">
                        {c.status !== 'published' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await moderateCourse(c.id, 'published');
                              setFeedback(
                                `Approved and published "${c.title}".`
                              );
                            }}
                            className="px-3 py-1 bg-[#16A34A] text-white font-semibold rounded hover:bg-emerald-700"
                          >
                            Approve & Publish
                          </button>
                        )}
                        {c.status === 'published' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await moderateCourse(c.id, 'archived');
                              setFeedback(`Archived course "${c.title}".`);
                            }}
                            className="px-3 py-1 bg-slate-200 text-[#111827] font-medium rounded hover:bg-slate-300"
                          >
                            Archive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Training Assignments, TNA & Reports + Google Sheets Live Integration */}
        {(section === 'dashboard' ||
          section === 'reports' ||
          section === 'training-assignments' ||
          section === 'organizations' ||
          section === 'departments') && (
          <div className="space-y-6">
            {/* Google Sheets Integration Panel */}
            <GoogleSheetsPanel />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assign Mandatory Training Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-[#111827]">
                  Assign Mandatory Corporate Training
                </h2>
                <form onSubmit={handleAssignTraining} className="space-y-3 text-xs">
                  <div>
                    <label
                      htmlFor="assign-user"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Select Employee / Learner
                    </label>
                    <select
                      id="assign-user"
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {users
                        .filter((u) => u.role === 'learner')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="assign-course"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Mandatory Course
                    </label>
                    <select
                      id="assign-course"
                      value={assignCourseId}
                      onChange={(e) => setAssignCourseId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {courses
                        .filter((c) => c.status === 'published')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="assign-due"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Required Completion Due Date
                    </label>
                    <input
                      id="assign-due"
                      type="date"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800"
                  >
                    Assign Mandatory Training
                  </button>
                </form>
              </div>

              {/* Create TNA Competency Record Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-[#111827]">
                  Record Training Needs Analysis (TNA) Competency Assessment
                </h2>
                <form onSubmit={handleCreateTNA} className="space-y-3 text-xs">
                  <div>
                    <label
                      htmlFor="tna-emp"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Employee
                    </label>
                    <select
                      id="tna-emp"
                      value={tnaEmpId}
                      onChange={(e) => setTnaEmpId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {users
                        .filter((u) => u.role === 'learner')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} — {u.jobTitle}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tna-comp"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Job Competency / Skill
                    </label>
                    <input
                      id="tna-comp"
                      type="text"
                      required
                      value={tnaCompName}
                      onChange={(e) => setTnaCompName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="tna-exp"
                        className="block font-semibold text-[#111827] mb-1"
                      >
                        Expected Level (1–5): {tnaExpected}
                      </label>
                      <input
                        id="tna-exp"
                        type="range"
                        min={1}
                        max={5}
                        value={tnaExpected}
                        onChange={(e) => setTnaExpected(Number(e.target.value))}
                        className="w-full accent-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tna-cur"
                        className="block font-semibold text-[#111827] mb-1"
                      >
                        Assessed Level (1–5): {tnaCurrent}
                      </label>
                      <input
                        id="tna-cur"
                        type="range"
                        min={1}
                        max={5}
                        value={tnaCurrent}
                        onChange={(e) => setTnaCurrent(Number(e.target.value))}
                        className="w-full accent-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="tna-rec"
                      className="block font-semibold text-[#111827] mb-1"
                    >
                      Recommended Learning Intervention
                    </label>
                    <select
                      id="tna-rec"
                      value={tnaCourseId}
                      onChange={(e) => setTnaCourseId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {courses
                        .filter((c) => c.status === 'published')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700"
                  >
                    Save TNA Competency Record
                  </button>
                </form>
              </div>
            </div>

            {/* TNA Matrix & CSV Export */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#111827]">
                    Corporate Training Needs Analysis (TNA) & Competency Gap Matrix
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Course completion and on-the-job competency evaluations are tracked
                    independently.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadCSVReport}
                  className="px-4 py-2 text-xs font-semibold text-[#111827] bg-[#F3F4F6] border border-slate-300 rounded-lg hover:bg-slate-200 inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" /> Export Training CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[#6B7280]">
                      <th className="py-2.5 pr-3">Employee & Role</th>
                      <th className="py-2.5 pr-3">Department</th>
                      <th className="py-2.5 pr-3">Competency</th>
                      <th className="py-2.5 pr-3 text-right">Expected</th>
                      <th className="py-2.5 pr-3 text-right">Current</th>
                      <th className="py-2.5 pr-3 text-right">Gap</th>
                      <th className="py-2.5 pr-3">Priority</th>
                      <th className="py-2.5">Recommended Course</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tnaRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 pr-3 font-semibold text-[#111827]">
                          {r.employeeName}
                          <div className="text-[11px] font-normal text-[#6B7280]">
                            {r.jobRole}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-[#6B7280]">
                          {r.departmentName}
                        </td>
                        <td className="py-2.5 pr-3 text-[#111827]">
                          {r.competencyName}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                          L{r.expectedLevel}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                          L{r.currentLevel}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono font-bold text-[#DC2626] tabular-nums">
                          -{r.gap}
                        </td>
                        <td className="py-2.5 pr-3 font-semibold">
                          <span
                            className={
                              r.priority === 'Critical'
                                ? 'text-[#DC2626]'
                                : r.priority === 'High'
                                ? 'text-[#D97706]'
                                : 'text-[#2563EB]'
                            }
                          >
                            {r.priority}
                          </span>
                        </td>
                        <td className="py-2.5 text-[#111827]">
                          {r.recommendedCourseTitle}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. Certificates Registry (/admin/certificates) */}
        {(section === 'certificates' || section === 'dashboard') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111827]">
              Issued Certificates Registry & Revocation Control
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[#6B7280]">
                    <th className="py-2.5 pr-3">Certificate No.</th>
                    <th className="py-2.5 pr-3">Learner Name</th>
                    <th className="py-2.5 pr-3">Course</th>
                    <th className="py-2.5 pr-3">Issued Date</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id}>
                      <td className="py-2.5 pr-3 font-mono font-bold text-[#0B1F3A]">
                        {cert.certificateNumber}
                      </td>
                      <td className="py-2.5 pr-3 font-semibold text-[#111827]">
                        {cert.learnerName}
                      </td>
                      <td className="py-2.5 pr-3 text-[#6B7280]">
                        {cert.courseTitle}
                      </td>
                      <td className="py-2.5 pr-3 font-mono">{cert.issuedAt}</td>
                      <td className="py-2.5 pr-3 font-semibold">
                        <span
                          className={
                            cert.status === 'valid'
                              ? 'text-[#16A34A]'
                              : 'text-[#DC2626]'
                          }
                        >
                          {cert.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {cert.status === 'valid' && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmRevokeCert({
                                id: cert.id,
                                number: cert.certificateNumber,
                                learner: cert.learnerName,
                              })
                            }
                            className="text-xs font-semibold text-[#DC2626] hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Immutable Security Audit Logs (/admin/audit-logs, /admin/dashboard) */}
        {(section === 'audit-logs' || section === 'dashboard') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0B1F3A]" />
              <h2 className="text-base font-bold text-[#111827]">
                Administrative & Security Audit Logs
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[#6B7280]">
                    <th className="py-2 pr-3">Timestamp</th>
                    <th className="py-2 pr-3">Actor</th>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 12).map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 pr-3 font-mono text-[#6B7280] whitespace-nowrap">
                        {log.createdAt.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-[#111827]">
                        {log.actorEmail}
                      </td>
                      <td className="py-2.5 pr-3 font-mono font-semibold text-[#2563EB]">
                        {log.action}
                      </td>
                      <td className="py-2.5 text-[#111827]">{log.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Categories, Learning Paths, Assessments, Notifications, Settings */}
        {(section === 'categories' ||
          section === 'learning-paths' ||
          section === 'assessments' ||
          section === 'notifications' ||
          section === 'settings') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111827]">
              Platform Configuration & Governance ({section.toUpperCase()})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F3F4F6] rounded-lg space-y-1">
                <div className="font-bold text-[#111827]">
                  Public Self-Registration Policy
                </div>
                <div className="text-[#16A34A] font-semibold">
                  STRICTLY DISABLED (Admin Provisioning Only)
                </div>
              </div>
              <div className="p-4 bg-[#F3F4F6] rounded-lg space-y-1">
                <div className="font-bold text-[#111827]">
                  Initial Super Admin Identity
                </div>
                <div className="font-mono text-[#111827]">
                  {BRAND.initialAdmin.fullName} ({BRAND.initialAdmin.email})
                </div>
              </div>
              <div className="p-4 bg-[#F3F4F6] rounded-lg space-y-1">
                <div className="font-bold text-[#111827]">
                  Active Categories & Learning Paths
                </div>
                <div>
                  {categories.length} Categories · {learningPaths.length} Learning
                  Paths · {assessments.length} Assessments
                </div>
              </div>
              <div className="p-4 bg-[#F3F4F6] rounded-lg space-y-1">
                <div className="font-bold text-[#111827]">
                  External Integrations Status
                </div>
                <div>
                  Google Sheets OAuth: Ready · Mux Video:{' '}
                  {platformSettings.muxVideoConfigured
                    ? 'Connected'
                    : 'Awaiting MUX_TOKEN_ID in .env'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
