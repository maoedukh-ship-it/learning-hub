'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { useHub } from '@/components/hub-context';
import {
  CheckCircle2,
  PlayCircle,
  FileText,
  Download,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
} from 'lucide-react';

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const {
    loading,
    courses,
    currentUser,
    enrollments,
    completeLesson,
    toggleBookmark,
    bookmarks,
  } = useHub();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const course =
    courses.find((c) => c.id === courseId || c.slug === courseId) || courses[0];

  if (loading || !course) {
    return (
      <PortalShell portalTitle="Course Player" requiredPortal="learner">
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-xs text-[#6B7280]">
          Loading course curriculum and lesson player...
        </div>
      </PortalShell>
    );
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentIndex = Math.max(
    0,
    allLessons.findIndex((l) => l.id === lessonId)
  );
  const activeLesson = allLessons[currentIndex] || allLessons[0];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const enrollment = enrollments.find(
    (e) => e.userId === currentUser?.id && e.courseId === course.id
  );
  const isCompleted =
    enrollment?.completedLessonIds.includes(activeLesson.id) ?? false;
  const isBookmarked = bookmarks.some(
    (b) => b.userId === currentUser?.id && b.courseId === course.id
  );

  const handleMarkComplete = async () => {
    setCompleting(true);
    setFeedback(null);
    try {
      const res = await completeLesson(course.id, activeLesson.id);
      if (res.ok) {
        if (res.certificate) {
          setFeedback(
            `Lesson marked complete! Certificate ${res.certificate.certificateNumber} has been issued.`
          );
        } else {
          setFeedback('Lesson progress saved and course completion recalculated.');
        }
      }
    } finally {
      setCompleting(false);
    }
  };

  return (
    <PortalShell
      portalTitle={`Course Player: ${course.title}`}
      requiredPortal="learner"
    >
      <div className="space-y-6">
        {/* Top Course Progress Header */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-[#6B7280]">
              <Link href="/learn/my-courses" className="hover:underline">
                My Courses
              </Link>{' '}
              · {course.categoryName}
            </div>
            <h1 className="text-lg font-bold text-[#111827]">{course.title}</h1>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-[#6B7280]">Validated Progress</div>
              <div className="text-sm font-bold font-mono text-[#111827] tabular-nums">
                {enrollment?.progressPercent ?? 0}% Completed
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleBookmark(course.id, activeLesson.id)}
              className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#2563EB]" />
              {isBookmarked ? 'Bookmarked' : 'Save Bookmark'}
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
            <span>{feedback}</span>
            <Link
              href="/learn/certificates"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              View Certificates →
            </Link>
          </div>
        )}

        {/* 2-Column Split Lesson Player + Curriculum Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Lesson Media & Content Stage */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            {activeLesson.type === 'video' && (
              <div className="bg-[#0B1F3A] text-white p-8 space-y-4 border-b border-slate-800">
                <div className="flex items-center justify-between text-xs text-blue-300 font-mono">
                  <span>SECURE ENTERPRISE STREAM · LESSON {currentIndex + 1}</span>
                  <span>{activeLesson.durationMinutes} MIN</span>
                </div>
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 border border-slate-700/80 rounded-xl bg-[#102A4C]">
                  <PlayCircle className="w-12 h-12 text-blue-400" />
                  <div className="text-base font-bold text-white max-w-lg">
                    {activeLesson.title}
                  </div>
                  <p className="text-xs text-slate-300 max-w-md">
                    Authorized Learner Session: {currentUser?.fullName} (
                    {currentUser?.email}) · Resume Position:{' '}
                    {enrollment?.lastPositionSeconds ?? 0}s
                  </p>
                </div>
              </div>
            )}

            <div className="p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs text-[#6B7280]">
                    Lesson {currentIndex + 1} of {allLessons.length} ·{' '}
                    {activeLesson.type.toUpperCase()} ·{' '}
                    <span className="font-mono">
                      {activeLesson.durationMinutes} min
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#111827] mt-1">
                    {activeLesson.title}
                  </h2>
                </div>

                <button
                  type="button"
                  data-testid="mark-complete-btn"
                  disabled={completing}
                  onClick={handleMarkComplete}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
                    isCompleted
                      ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                      : 'bg-[#2563EB] text-white hover:bg-blue-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCompleted
                    ? 'Completed (Server Verified)'
                    : completing
                    ? 'Saving...'
                    : 'Mark Lesson Complete'}
                </button>
              </div>

              {/* Lesson Reading / Transcript Content */}
              <div className="space-y-4 text-sm text-[#111827] leading-relaxed whitespace-pre-line">
                {activeLesson.content}
              </div>

              {/* If Quiz Lesson, direct CTA to Assessment Engine */}
              {activeLesson.assessmentId && (
                <div className="p-5 bg-[#F3F4F6] border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#2563EB]" />
                      Graded Certification Assessment Linked
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Launch the server-validated exam to qualify for your course
                      certificate.
                    </p>
                  </div>
                  <Link
                    href={`/learn/assessments/${activeLesson.assessmentId}`}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800 whitespace-nowrap"
                  >
                    Launch Assessment →
                  </Link>
                </div>
              )}

              {/* Downloadable Resources */}
              {activeLesson.resources.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-[#111827]">
                    Authorized Learning Resources & Attachments
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLesson.resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        download
                        className="p-3.5 border border-slate-200 rounded-lg hover:bg-[#F3F4F6] transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-[#111827] truncate">
                            {res.title}
                          </div>
                          <div className="text-[11px] text-[#6B7280] font-mono">
                            {res.fileType} · {res.sizeLabel}
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-[#2563EB] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous / Next Lesson Controls */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
                {prevLesson ? (
                  <Link
                    href={`/learn/courses/${course.id}/lessons/${prevLesson.id}`}
                    className="px-4 py-2 text-xs font-medium text-[#111827] border border-slate-300 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous:{' '}
                    {prevLesson.title}
                  </Link>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Link
                    href={`/learn/courses/${course.id}/lessons/${nextLesson.id}`}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800 inline-flex items-center gap-1.5"
                  >
                    Next: {nextLesson.title}{' '}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : course.assessmentId ? (
                  <Link
                    href={`/learn/assessments/${course.assessmentId}`}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 inline-flex items-center gap-1.5"
                  >
                    Proceed to Final Assessment{' '}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right: Course Curriculum Sidebar */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#0B1F3A] text-white">
              <h3 className="text-sm font-bold">Course Curriculum</h3>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                {enrollment?.completedLessonIds.length ?? 0} of {allLessons.length}{' '}
                Lessons Completed
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {course.sections.map((section) => (
                <div key={section.id}>
                  <div className="px-4 py-2.5 bg-[#F3F4F6] text-xs font-bold text-[#111827]">
                    {section.title}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {section.lessons.map((les) => {
                      const done =
                        enrollment?.completedLessonIds.includes(les.id) ?? false;
                      const isCurrent = les.id === activeLesson.id;
                      return (
                        <Link
                          key={les.id}
                          href={`/learn/courses/${course.id}/lessons/${les.id}`}
                          className={`px-4 py-3 flex items-start gap-3 text-xs transition-colors ${
                            isCurrent
                              ? 'bg-blue-50/80 font-semibold text-[#2563EB]'
                              : 'hover:bg-slate-50 text-[#111827]'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{les.title}</div>
                            <div className="text-[11px] text-[#6B7280] font-mono">
                              {les.type} · {les.durationMinutes}m
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
