'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicShell } from '@/components/public-shell';
import { CourseVisual } from '@/components/course-visual';
import { useHub } from '@/components/hub-context';
import {
  CheckCircle2,
  PlayCircle,
  FileText,
  Award,
  Bookmark,
  ArrowRight,
  Lock,
} from 'lucide-react';

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const {
    loading,
    courses,
    currentUser,
    enrollments,
    bookmarks,
    enrollInCourse,
    toggleBookmark,
  } = useHub();

  const course = courses.find((c) => c.slug === slug || c.id === slug);

  if (loading) {
    return (
      <PublicShell>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 text-xs text-[#6B7280]">
          Loading course syllabus and curriculum...
        </div>
      </PublicShell>
    );
  }

  if (!course || (course.status !== 'published' && currentUser?.role !== 'super_admin' && currentUser?.id !== course.instructorId)) {
    return (
      <PublicShell>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#111827]">
            Course Not Found or Unpublished
          </h1>
          <p className="text-sm text-[#6B7280]">
            The requested course is either unpublished or does not exist in the public
            catalog.
          </p>
          <Link
            href="/courses"
            className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] rounded-lg"
          >
            Back to Course Catalog
          </Link>
        </div>
      </PublicShell>
    );
  }

  const enrollment = enrollments.find(
    (e) => e.userId === currentUser?.id && e.courseId === course.id
  );
  const isBookmarked = bookmarks.some(
    (b) => b.userId === currentUser?.id && b.courseId === course.id
  );
  const firstLessonId =
    course.sections[0]?.lessons[0]?.id || 'les-cyber-1';
  const resumeLessonId =
    enrollment?.lastAccessedLessonId || firstLessonId;

  const handleStartOrResume = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (!enrollment && course.status === 'published') {
      await enrollInCourse(course.id);
    }
    router.push(`/learn/courses/${course.id}/lessons/${resumeLessonId}`);
  };

  return (
    <PublicShell>
      {/* Course Header */}
      <section className="bg-[#0B1F3A] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300">
              <Link href="/courses" className="hover:underline">
                Courses
              </Link>
              <span aria-hidden="true">·</span>
              <span>{course.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {course.durationHours} Hours
              </span>
              <span aria-hidden="true">·</span>
              <span>{course.language}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {course.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {course.fullDescription}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div>
                Instructor:{' '}
                <strong className="text-white">{course.instructorName}</strong> (
                {course.instructorTitle})
              </div>
              <div>
                Passing Requirement:{' '}
                <strong className="text-white font-mono">
                  {course.passingScore}%
                </strong>
              </div>
              {course.publishedAt && (
                <div>
                  Published:{' '}
                  <span className="font-mono">{course.publishedAt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Action Card */}
          <div className="lg:col-span-4 bg-[#102A4C] border border-slate-700 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <CourseVisual
              theme={course.thumbnailTheme}
              categoryName={course.categoryName}
              className="h-32 rounded-lg"
            />

            {enrollment ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Your Enrolled Progress</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {enrollment.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB]"
                    style={{ width: `${enrollment.progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-300">
                Includes full lesson curriculum, downloadable reference checklists,
                server-graded certification assessment, and verifiable digital
                certificate.
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleStartOrResume}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center justify-center gap-2"
              >
                {enrollment
                  ? enrollment.progressPercent === 100
                    ? 'Review Completed Course'
                    : 'Resume Learning'
                  : 'Enroll & Start Course'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => toggleBookmark(course.id)}
                  className="w-full py-2 px-4 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isBookmarked ? 'Saved in Bookmarks' : 'Bookmark Course'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Course Objectives, Prerequisites & Curriculum */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Learning Objectives */}
          <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-4">
            <h2 className="text-lg font-bold text-[#111827]">
              Learning Objectives
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#111827]">
              {course.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Structured Curriculum */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#111827]">
              Course Curriculum & Modules
            </h2>
            <div className="space-y-4">
              {course.sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                >
                  <div className="px-5 py-3.5 bg-[#F3F4F6] border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#111827]">
                      {section.title}
                    </h3>
                    <span className="text-xs text-[#6B7280] font-mono">
                      {section.lessons.length} Lessons
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {section.lessons.map((lesson) => {
                      const isDone =
                        enrollment?.completedLessonIds.includes(lesson.id) ?? false;
                      return (
                        <div
                          key={lesson.id}
                          className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                            ) : lesson.type === 'video' ? (
                              <PlayCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
                            ) : lesson.type === 'quiz' ? (
                              <Award className="w-4 h-4 text-[#D97706] shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-[#6B7280] shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-[#111827]">
                                {lesson.title}
                              </div>
                              <div className="text-[11px] text-[#6B7280]">
                                Type: {lesson.type.toUpperCase()} ·{' '}
                                <span className="font-mono">
                                  {lesson.durationMinutes} min
                                </span>
                                {lesson.resources.length > 0 &&
                                  ` · ${lesson.resources.length} downloadable resource(s)`}
                              </div>
                            </div>
                          </div>

                          {currentUser ? (
                            <Link
                              href={`/learn/courses/${course.id}/lessons/${lesson.id}`}
                              className="px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
                            >
                              {isDone ? 'Review' : 'Open Lesson →'}
                            </Link>
                          ) : (
                            <span className="text-[11px] text-[#6B7280] inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Sign in required
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Prerequisites & Certification Rules */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">Prerequisites</h3>
            <ul className="space-y-2 text-xs text-[#6B7280]">
              {course.prerequisites.map((pre, i) => (
                <li key={i}>• {pre}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-[#F3F4F6] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <span>Certificate Eligibility Rules</span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Learners earn an official Learning Hub Certificate upon completing
              100% of lessons in this course and achieving a minimum score of{' '}
              <strong className="text-[#111827] font-mono">
                {course.passingScore}%
              </strong>{' '}
              on the server-graded certification assessment.
            </p>
            {course.assessmentId && (
              <Link
                href={`/learn/assessments/${course.assessmentId}`}
                className="inline-block text-xs font-semibold text-[#2563EB] hover:underline pt-1"
              >
                Go to Course Assessment →
              </Link>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
