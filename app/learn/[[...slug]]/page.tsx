'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { useHub } from '@/components/hub-context';
import { BRAND, ROLE_LABELS } from '@/lib/brand';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Bell,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

export default function LearnerPortalCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = use(params);
  const section = slug?.[0] || 'dashboard';
  const subId = slug?.[1];

  const {
    currentUser,
    courses,
    enrollments,
    learningPaths,
    assessments,
    assessmentAttempts,
    certificates,
    bookmarks,
    notifications,
    markNotificationsRead,
  } = useHub();

  const myEnrollments = enrollments.filter(
    (e) => e.userId === currentUser?.id
  );
  const myCertificates = certificates.filter(
    (c) => c.userId === currentUser?.id && c.status === 'valid'
  );
  const myAttempts = assessmentAttempts.filter(
    (a) => a.userId === currentUser?.id
  );
  const myNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id
  );
  const myBookmarks = bookmarks.filter((b) => b.userId === currentUser?.id);

  // If visiting /learn/courses/[courseId], show course overview inside learner portal
  if (section === 'courses' && subId) {
    const course =
      courses.find((c) => c.id === subId || c.slug === subId) || courses[0];
    const firstLes = course.sections[0]?.lessons[0]?.id || 'les-cyber-1';
    return (
      <PortalShell portalTitle={course.title} requiredPortal="learner">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="text-xs text-[#6B7280]">
            {course.categoryName} · {course.level} · {course.durationHours} Hours
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">{course.title}</h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {course.fullDescription}
          </p>
          <Link
            href={`/learn/courses/${course.id}/lessons/${firstLes}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] rounded-lg"
          >
            Enter Lesson Player <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      portalTitle={`Learner Portal — ${section.replace('-', ' ').toUpperCase()}`}
      requiredPortal="learner"
    >
      <div className="space-y-8">
        {/* Top KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Enrolled Courses</div>
            <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums mt-1">
              {myEnrollments.length}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              Active & completed modules
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Completed Courses</div>
            <div className="text-2xl font-bold text-[#16A34A] font-mono tabular-nums mt-1">
              {myEnrollments.filter((e) => e.status === 'completed').length}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              100% server-validated
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Mandatory Training</div>
            <div className="text-2xl font-bold text-[#2563EB] font-mono tabular-nums mt-1">
              {myEnrollments.filter((e) => e.isMandatory).length}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              Assigned by L&D / Manager
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Earned Certificates</div>
            <div className="text-2xl font-bold text-[#0B1F3A] font-mono tabular-nums mt-1">
              {myCertificates.length}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              Publicly verifiable credentials
            </div>
          </div>
        </div>

        {/* Section-Specific View or Complete Learner Dashboard */}
        {(section === 'dashboard' ||
          section === 'my-courses' ||
          section === 'assigned-training') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  {section === 'assigned-training'
                    ? 'Mandatory & Assigned Corporate Training'
                    : 'My Enrolled Courses & Resume Progress'}
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Resume learning directly from your last saved lesson position.
                </p>
              </div>
              <Link
                href="/courses"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Browse Catalog →
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {myEnrollments
                .filter((e) =>
                  section === 'assigned-training' ? e.isMandatory : true
                )
                .map((enr) => {
                  const course = courses.find((c) => c.id === enr.courseId);
                  if (!course) return null;
                  const resumeLes =
                    enr.lastAccessedLessonId ||
                    course.sections[0]?.lessons[0]?.id ||
                    'les-cyber-1';
                  const isOverdue =
                    enr.dueDate &&
                    enr.status !== 'completed' &&
                    enr.dueDate < '2026-10-22';

                  return (
                    <div
                      key={enr.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                          <span>{course.categoryName}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Status:{' '}
                            <strong className="text-[#111827]">
                              {enr.status.replace('_', ' ').toUpperCase()}
                            </strong>
                          </span>
                          {enr.dueDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span
                                className={
                                  isOverdue
                                    ? 'text-red-700 font-semibold'
                                    : 'font-mono'
                                }
                              >
                                Due: {enr.dueDate}
                                {isOverdue ? ' (OVERDUE)' : ''}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-[#111827]">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2563EB]"
                              style={{ width: `${enr.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-semibold text-[#111827] tabular-nums">
                            {enr.progressPercent}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href={`/learn/courses/${course.id}/lessons/${resumeLes}`}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          {enr.status === 'completed'
                            ? 'Review Lesson'
                            : 'Resume Lesson →'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {(section === 'dashboard' || section === 'certificates') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827]">
                Earned Digital Certificates
              </h2>
              <Link
                href="/certificates/verify"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Public Verification Portal →
              </Link>
            </div>
            {myCertificates.length === 0 ? (
              <p className="text-xs text-[#6B7280]">
                Complete 100% of lessons and pass the course assessment to unlock
                your official digital certificate.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-5 border border-slate-200 rounded-xl bg-[#F3F4F6]/50 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#0B1F3A]">
                        {cert.certificateNumber}
                      </span>
                      <span className="text-[#16A34A] font-semibold">
                        VERIFIED ACTIVE
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">
                      {cert.courseTitle}
                    </h3>
                    <div className="text-xs text-[#6B7280]">
                      Recipient: {cert.learnerName} · Issued: {cert.issuedAt}
                    </div>
                    <div className="pt-2 flex items-center gap-3 text-xs">
                      <Link
                        href="/certificates/verify"
                        className="font-semibold text-[#2563EB] hover:underline"
                      >
                        Inspect & Verify Certificate →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(section === 'assessments' || section === 'results') && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-base font-bold text-[#111827]">
              Course Assessments & Attempt History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="p-5 border border-slate-200 rounded-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs text-[#6B7280] font-mono">
                      Pass Score: {a.passingScore}% · Max {a.maxAttempts} Attempts
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">
                      {a.title}
                    </h3>
                    <p className="text-xs text-[#6B7280]">{a.description}</p>
                  </div>
                  <Link
                    href={`/learn/assessments/${a.id}`}
                    className="px-4 py-2 text-xs font-semibold text-center text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800"
                  >
                    Start / Review Assessment
                  </Link>
                </div>
              ))}
            </div>

            {myAttempts.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-[#111827]">
                  Recorded Server-Graded Attempts
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[#6B7280]">
                      <th className="py-2">Assessment</th>
                      <th className="py-2">Attempt #</th>
                      <th className="py-2">Score</th>
                      <th className="py-2">Outcome</th>
                      <th className="py-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAttempts.map((att) => (
                      <tr key={att.id}>
                        <td className="py-2.5 font-medium text-[#111827]">
                          {att.assessmentId}
                        </td>
                        <td className="py-2.5 font-mono">#{att.attemptNumber}</td>
                        <td className="py-2.5 font-mono font-bold tabular-nums">
                          {att.scorePercent}%
                        </td>
                        <td className="py-2.5">
                          <span
                            className={
                              att.passed
                                ? 'text-[#16A34A] font-semibold'
                                : 'text-red-700 font-semibold'
                            }
                          >
                            {att.passed ? 'PASSED' : 'NOT PASSED'}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[#6B7280]">
                          {att.submittedAt.slice(0, 10)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {section === 'learning-paths' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111827]">
              Recommended Learning Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningPaths.map((lp) => (
                <div
                  key={lp.id}
                  className="p-5 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="text-xs text-[#6B7280] font-mono">
                    {lp.estimatedHours} Hours · {lp.courseIds.length} Courses
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    {lp.title}
                  </h3>
                  <p className="text-xs text-[#6B7280]">{lp.description}</p>
                  <Link
                    href={`/learning-paths/${lp.slug}`}
                    className="inline-block text-xs font-semibold text-[#2563EB] hover:underline pt-1"
                  >
                    Open Track →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'bookmarks' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111827]">
              Saved Course Bookmarks
            </h2>
            {myBookmarks.length === 0 ? (
              <p className="text-xs text-[#6B7280]">No bookmarked courses yet.</p>
            ) : (
              <div className="space-y-2">
                {myBookmarks.map((b, i) => {
                  const c = courses.find((course) => course.id === b.courseId);
                  if (!c) return null;
                  return (
                    <div
                      key={i}
                      className="p-4 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-[#111827]">
                        {c.title}
                      </span>
                      <Link
                        href={`/courses/${c.slug}`}
                        className="text-[#2563EB] font-semibold hover:underline"
                      >
                        Open Course →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {section === 'notifications' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827]">
                Learner Notifications
              </h2>
              <button
                type="button"
                onClick={() => markNotificationsRead()}
                className="px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Mark All Read
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {myNotifications.map((n) => (
                <div key={n.id} className="py-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111827]">{n.title}</span>
                    <span className="font-mono text-[#6B7280]">
                      {n.createdAt.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-[#6B7280]">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(section === 'profile' || section === 'settings') && currentUser && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#111827]">
              Authorized Profile & Role Security
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F3F4F6] rounded-lg">
                <div className="text-[#6B7280]">Full Name</div>
                <div className="font-bold text-[#111827] mt-0.5">
                  {currentUser.fullName}
                </div>
              </div>
              <div className="p-4 bg-[#F3F4F6] rounded-lg">
                <div className="text-[#6B7280]">Login Identifier / Email</div>
                <div className="font-mono font-bold text-[#111827] mt-0.5">
                  {currentUser.email}
                </div>
              </div>
              <div className="p-4 bg-[#F3F4F6] rounded-lg">
                <div className="text-[#6B7280]">
                  Server-Assigned Authorization Role (Read-Only)
                </div>
                <div className="font-bold text-[#2563EB] mt-0.5">
                  {ROLE_LABELS[currentUser.role]}
                </div>
              </div>
              <div className="p-4 bg-[#F3F4F6] rounded-lg">
                <div className="text-[#6B7280]">Employee ID & Job Title</div>
                <div className="font-bold text-[#111827] mt-0.5">
                  {currentUser.employeeId || 'N/A'} · {currentUser.jobTitle}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
