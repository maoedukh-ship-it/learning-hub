'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { useHub } from '@/components/hub-context';
import {
  GradedAssessmentOutput,
  SubmissionAnswerMap,
  CertificateRecord,
} from '@/lib/lms-logic';
import { CheckCircle2, XCircle, Award, Clock, ShieldCheck } from 'lucide-react';

export default function AssessmentTakePage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const {
    loading,
    assessments,
    assessmentAttempts,
    currentUser,
    submitAssessment,
  } = useHub();

  const [answers, setAnswers] = useState<SubmissionAnswerMap>({});
  const [result, setResult] = useState<GradedAssessmentOutput | null>(null);
  const [issuedCert, setIssuedCert] = useState<CertificateRecord | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const assessment =
    assessments.find((a) => a.id === assessmentId || a.courseId === assessmentId) ||
    assessments[0];

  if (loading || !assessment) {
    return (
      <PortalShell portalTitle="Course Assessment" requiredPortal="learner">
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-xs text-[#6B7280]">
          Loading server-validated assessment questions...
        </div>
      </PortalShell>
    );
  }

  const myAttempts = assessmentAttempts.filter(
    (att) =>
      att.assessmentId === assessment.id && att.userId === currentUser?.id
  );

  const handleSingleSelect = (qId: string, optId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleMultiSelect = (qId: string, optId: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[qId]) ? (prev[qId] as string[]) : [];
      const next = current.includes(optId)
        ? current.filter((x) => x !== optId)
        : [...current, optId];
      return { ...prev, [qId]: next };
    });
  };

  const handleTextAnswer = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await submitAssessment(assessment.id, answers);
      if (!res.ok) {
        setError(res.error || 'Submission failed.');
      } else if (res.graded) {
        setResult(res.graded);
        setIssuedCert(res.certificate);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalShell
      portalTitle={`Assessment: ${assessment.title}`}
      requiredPortal="learner"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Assessment Header Card */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
            <span>Course: {assessment.courseTitle}</span>
            <span className="font-mono tabular-nums inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Time Limit:{' '}
              {assessment.timeLimitMinutes} Min · Passing Score:{' '}
              {assessment.passingScore}% · Attempts Used: {myAttempts.length}/
              {assessment.maxAttempts}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">
            {assessment.title}
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {assessment.description} Answer keys are stored and evaluated
            exclusively on the server.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
            {error}
          </div>
        )}

        {/* Graded Result Banner */}
        {result && (
          <div
            className={`p-6 border rounded-xl space-y-4 ${
              result.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {result.passed ? (
                  <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#D97706] shrink-0" />
                )}
                <div>
                  <h2 className="text-lg font-bold">
                    {result.passed
                      ? 'Examination Passed — Server Verified'
                      : 'Minimum Passing Threshold Not Reached'}
                  </h2>
                  <p className="text-xs">
                    Attempt #{result.attemptNumber} · Remaining Attempts:{' '}
                    {result.remainingAttempts}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-2xl font-bold tabular-nums">
                  {result.scorePercent}%
                </div>
                <div className="text-xs">
                  {result.earnedPoints} / {result.totalPoints} pts
                </div>
              </div>
            </div>

            {issuedCert && (
              <div className="p-4 bg-white border border-emerald-300 rounded-lg flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 font-semibold text-[#111827]">
                  <Award className="w-4 h-4 text-[#2563EB]" />
                  <span>
                    Certificate Issued: {issuedCert.certificateNumber}
                  </span>
                </div>
                <Link
                  href="/learn/certificates"
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  View & Download Certificate →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Assessment Form */}
        <form onSubmit={handleSubmitExam} className="space-y-5">
          {assessment.questions.map((q, idx) => {
            const qFeedback = result?.questionResults.find(
              (r) => r.questionId === q.id
            );

            return (
              <div
                key={q.id}
                className="p-6 bg-white border border-slate-200 rounded-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm font-bold text-[#111827]">
                    {idx + 1}. {q.prompt}
                  </div>
                  <span className="text-xs font-mono text-[#6B7280] shrink-0">
                    {q.points} pts
                  </span>
                </div>

                {(q.type === 'multiple_choice' || q.type === 'true_false') &&
                  q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const checked = answers[q.id] === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-xs transition-colors ${
                              checked
                                ? 'border-[#2563EB] bg-blue-50/40 font-semibold text-[#111827]'
                                : 'border-slate-200 hover:bg-slate-50 text-[#111827]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.id}
                              checked={checked}
                              onChange={() => handleSingleSelect(q.id, opt.id)}
                              className="accent-[#2563EB]"
                            />
                            <span>{opt.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                {q.type === 'multiple_select' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const arr = Array.isArray(answers[q.id])
                        ? (answers[q.id] as string[])
                        : [];
                      const checked = arr.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-xs transition-colors ${
                            checked
                              ? 'border-[#2563EB] bg-blue-50/40 font-semibold text-[#111827]'
                              : 'border-slate-200 hover:bg-slate-50 text-[#111827]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleMultiSelect(q.id, opt.id)}
                            className="accent-[#2563EB]"
                          />
                          <span>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div>
                    <input
                      type="text"
                      aria-label={`Answer for question ${idx + 1}`}
                      placeholder="Type your concise answer..."
                      value={typeof answers[q.id] === 'string' ? (answers[q.id] as string) : ''}
                      onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg text-[#111827]"
                    />
                  </div>
                )}

                {qFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      qFeedback.correct
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'bg-red-50 text-red-900'
                    }`}
                  >
                    <strong>
                      {qFeedback.correct ? 'Correct' : 'Incorrect'} (
                      {qFeedback.earnedPoints}/{qFeedback.maxPoints} pts):
                    </strong>{' '}
                    {qFeedback.explanation}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#6B7280] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Submissions are validated and scored server-side.</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors"
            >
              {submitting ? 'Grading Submission...' : 'Submit Assessment for Grading'}
            </button>
          </div>
        </form>
      </div>
    </PortalShell>
  );
}
