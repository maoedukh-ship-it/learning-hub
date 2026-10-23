'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { useHub } from '@/components/hub-context';
import { BookOpen, PlusCircle, CheckCircle2, Layers, Users } from 'lucide-react';

export default function InstructorPortalCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = use(params);
  const section = slug?.[0] || 'dashboard';
  const targetCourseId = slug?.[1];

  const {
    currentUser,
    courses,
    categories,
    enrollments,
    assessmentAttempts,
    createCourse,
    addCurriculumLesson,
  } = useHub();

  const myCourses = courses.filter(
    (c) =>
      currentUser?.role === 'super_admin' || c.instructorId === currentUser?.id
  );

  // Course creation state
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [catId, setCatId] = useState('cat-sec');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    'Intermediate'
  );
  const [hours, setHours] = useState(5);
  const [passingScore, setPassingScore] = useState(80);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Curriculum editor state
  const [selectedCourseId, setSelectedCourseId] = useState(
    targetCourseId && targetCourseId !== 'new'
      ? targetCourseId
      : myCourses[0]?.id || 'course-cyber-101'
  );
  const [sectionTitle, setSectionTitle] = useState(
    'Module 2: Advanced Implementation'
  );
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<
    'video' | 'reading' | 'document' | 'quiz'
  >('video');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [lessonContent, setLessonContent] = useState('');

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    const res = await createCourse({
      title,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      categoryId: catId,
      level,
      durationHours: hours,
      passingScore,
    });
    if (!res.ok) {
      setErrorMsg(res.error || 'Failed to create course.');
    } else {
      setFeedback(
        `Created course "${res.course?.title}" (${res.course?.status}).`
      );
      setTitle('');
      setShortDesc('');
      setFullDesc('');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    const res = await addCurriculumLesson({
      courseId: selectedCourseId,
      sectionTitle,
      lessonTitle,
      lessonType,
      durationMinutes,
      content: lessonContent,
    });
    if (!res.ok) {
      setErrorMsg(res.error || 'Failed to add lesson.');
    } else {
      setFeedback(`Added lesson "${lessonTitle}" to course curriculum.`);
      setLessonTitle('');
      setLessonContent('');
    }
  };

  return (
    <PortalShell
      portalTitle={`Instructor Studio — ${section.toUpperCase()}`}
      requiredPortal="instructor"
    >
      <div className="space-y-8">
        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>{feedback}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
            {errorMsg}
          </div>
        )}

        {/* Instructor KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Authored Courses</div>
            <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums mt-1">
              {myCourses.length}
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Course Enrollments</div>
            <div className="text-2xl font-bold text-[#2563EB] font-mono tabular-nums mt-1">
              {
                enrollments.filter((e) =>
                  myCourses.some((c) => c.id === e.courseId)
                ).length
              }
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Graded Exam Attempts</div>
            <div className="text-2xl font-bold text-[#16A34A] font-mono tabular-nums mt-1">
              {assessmentAttempts.length}
            </div>
          </div>
        </div>

        {/* Course Creation & Curriculum Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Course Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <PlusCircle className="w-4 h-4 text-[#2563EB]" />
              <span>Create & Submit New Course</span>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label
                  htmlFor="inst-course-title"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Course Title
                </label>
                <input
                  id="inst-course-title"
                  type="text"
                  required
                  placeholder="e.g., Secure API Architecture & OAuth 2.1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="inst-cat"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="inst-cat"
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inst-level"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Difficulty Level
                  </label>
                  <select
                    id="inst-level"
                    value={level}
                    onChange={(e) =>
                      setLevel(
                        e.target.value as 'Beginner' | 'Intermediate' | 'Advanced'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="inst-short"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Short Summary
                </label>
                <input
                  id="inst-short"
                  type="text"
                  required
                  placeholder="Concise 1-sentence course summary..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="inst-full"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Full Course Description & Syllabus
                </label>
                <textarea
                  id="inst-full"
                  rows={3}
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800"
              >
                Create Course & Submit for Review
              </button>
            </form>
          </div>

          {/* Curriculum Builder (Add Section / Lesson) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>Curriculum Builder — Add Section & Lesson</span>
            </div>
            <form onSubmit={handleAddLesson} className="space-y-3 text-xs">
              <div>
                <label
                  htmlFor="cur-course"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Target Course
                </label>
                <select
                  id="cur-course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cur-sec"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Module / Section Title
                </label>
                <input
                  id="cur-sec"
                  type="text"
                  required
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="cur-les-title"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Lesson Title
                  </label>
                  <input
                    id="cur-les-title"
                    type="text"
                    required
                    placeholder="e.g., 2.2 Mutual TLS Verification"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cur-les-type"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Lesson Format
                  </label>
                  <select
                    id="cur-les-type"
                    value={lessonType}
                    onChange={(e) =>
                      setLessonType(
                        e.target.value as 'video' | 'reading' | 'document' | 'quiz'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="video">Video Lesson</option>
                    <option value="reading">Reading / Article</option>
                    <option value="document">Document / Slides</option>
                    <option value="quiz">Quiz / Assessment</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="cur-les-content"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Lesson Reading Material / Transcript
                </label>
                <textarea
                  id="cur-les-content"
                  rows={3}
                  required
                  placeholder="Enter lesson guidance and technical notes..."
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700"
              >
                Add Lesson to Curriculum
              </button>
            </form>
          </div>
        </div>

        {/* Authored Courses List */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#111827]">
            My Managed Courses
          </h2>
          <div className="divide-y divide-slate-200">
            {myCourses.map((c) => (
              <div
                key={c.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="text-[#6B7280]">
                    {c.categoryName} · {c.level} · Status:{' '}
                    <strong className="text-[#111827]">
                      {c.status.toUpperCase()}
                    </strong>
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">{c.title}</h3>
                  <div className="text-[#6B7280] font-mono">
                    {c.sections.length} Modules ·{' '}
                    {c.sections.reduce((acc, s) => acc + s.lessons.length, 0)}{' '}
                    Lessons
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/courses/${c.slug}`}
                    className="px-3.5 py-2 font-semibold text-[#2563EB] border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Preview Course →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
