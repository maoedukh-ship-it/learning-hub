import { BRAND, UserRole } from './brand';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending_activation';
  employeeId?: string;
  organizationId?: string;
  departmentId?: string;
  teamId?: string;
  jobTitle?: string;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LessonItem {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  type: 'video' | 'reading' | 'document' | 'quiz';
  durationMinutes: number;
  orderIndex: number;
  content: string;
  videoUrl?: string;
  resources: { id: string; title: string; fileType: string; sizeLabel: string; url: string }[];
  assessmentId?: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: LessonItem[];
}

export interface CourseRecord {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  categoryName: string;
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  language: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  publishedAt?: string;
  objectives: string[];
  prerequisites: string[];
  passingScore: number;
  certificateEligible: boolean;
  isMandatoryDefault?: boolean;
  thumbnailTheme: 'navy' | 'cobalt' | 'emerald' | 'slate' | 'amber' | 'indigo';
  sections: CourseSection[];
  assessmentId?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer';
  prompt: string;
  options?: QuestionOption[];
  correctOptionIds?: string[];
  acceptedAnswers?: string[];
  points: number;
  explanation: string;
}

export interface AssessmentRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  questions: AssessmentQuestion[];
}

export interface SanitizedQuestion {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer';
  prompt: string;
  options?: QuestionOption[];
  points: number;
}

export interface SanitizedAssessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  questions: SanitizedQuestion[];
}

export interface EnrollmentRecord {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
  lastPositionSeconds?: number;
  progressPercent: number;
  assessmentPassed: boolean;
  bestScore?: number;
  completedAt?: string;
  certificateId?: string;
  assignedBy?: string;
  dueDate?: string;
  isMandatory?: boolean;
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  userId: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  issuingAuthority: string;
  signatory: string;
  status: 'valid' | 'revoked';
  revokedAt?: string;
  revokedReason?: string;
}

export interface TNARecord {
  id: string;
  employeeId: string;
  employeeName: string;
  jobRole: string;
  organizationId: string;
  departmentName: string;
  competencyName: string;
  expectedLevel: number; // 1 to 5
  currentLevel: number; // 1 to 5
  gap: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedCourseId: string;
  recommendedCourseTitle: string;
  responsibleManager: string;
  reviewDate: string;
  status: 'identified' | 'assigned' | 'in_progress' | 'closed';
}

/**
 * 1. Public Registration Blocking & Account Creation Security
 */
export function canRegisterPublicly(): { allowed: false; reason: string } {
  return {
    allowed: false,
    reason: 'Public learner registration is disabled. Accounts must be provisioned by an authorized administrator.',
  };
}

export function validateAdminUserProvisioning(
  actor: Pick<UserProfile, 'id' | 'role' | 'status'> | null,
  input: {
    fullName: string;
    email: string;
    requestedRole?: UserRole;
    existingEmails: string[];
  }
): {
  valid: boolean;
  error?: string;
  assignedRole?: UserRole;
  normalizedEmail?: string;
} {
  if (!actor || actor.status !== 'active') {
    return { valid: false, error: 'Unauthorized: Active administrator session required.' };
  }
  if (actor.role !== 'super_admin') {
    return { valid: false, error: 'Forbidden: Only Super Admins may create user accounts.' };
  }

  const trimmedName = input.fullName.trim();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, error: 'Please provide a valid corporate or learner email address.' };
  }

  const exists = input.existingEmails.some((e) => e.toLowerCase() === normalizedEmail);
  if (exists) {
    return { valid: false, error: 'An account with this email address already exists.' };
  }

  // Only allow trusted roles assigned by Super Admin; default to learner
  const allowedRoles: UserRole[] = ['learner', 'instructor', 'manager', 'super_admin'];
  const assignedRole: UserRole =
    input.requestedRole && allowedRoles.includes(input.requestedRole)
      ? input.requestedRole
      : 'learner';

  return {
    valid: true,
    assignedRole,
    normalizedEmail,
  };
}

/**
 * Prevents client-supplied role escalation by learners or non-admins.
 */
export function resolveSafeRoleForSelfUpdate(
  currentUser: Pick<UserProfile, 'role'>,
  attemptedNewRole?: UserRole
): { allowed: boolean; role: UserRole; error?: string } {
  if (attemptedNewRole && attemptedNewRole !== currentUser.role) {
    return {
      allowed: false,
      role: currentUser.role,
      error: 'Privilege escalation blocked: Users cannot modify their own authorization role.',
    };
  }
  return { allowed: true, role: currentUser.role };
}

/**
 * 2. Route & Resource Authorization (RBAC)
 */
export function canAccessPortalRoute(
  user: Pick<UserProfile, 'role' | 'status'> | null,
  pathname: string
): { allowed: boolean; redirectTo?: string; reason?: string } {
  // Public routes
  const isProtected =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/instructor') ||
    pathname.startsWith('/organization') ||
    pathname.startsWith('/learn');

  if (!isProtected) {
    return { allowed: true };
  }

  if (!user) {
    return { allowed: false, redirectTo: '/login', reason: 'Authentication required.' };
  }

  if (user.status !== 'active') {
    return { allowed: false, redirectTo: '/login', reason: 'Account is suspended or inactive.' };
  }

  if (pathname.startsWith('/admin')) {
    if (user.role === 'super_admin') return { allowed: true };
    return {
      allowed: false,
      redirectTo: '/learn/dashboard',
      reason: 'Super Admin role required for administrative portal.',
    };
  }

  if (pathname.startsWith('/instructor')) {
    if (user.role === 'instructor' || user.role === 'super_admin') return { allowed: true };
    return {
      allowed: false,
      redirectTo: '/learn/dashboard',
      reason: 'Instructor or Super Admin role required.',
    };
  }

  if (pathname.startsWith('/organization')) {
    if (user.role === 'manager' || user.role === 'super_admin') return { allowed: true };
    return {
      allowed: false,
      redirectTo: '/learn/dashboard',
      reason: 'Organization Manager or Super Admin role required.',
    };
  }

  if (pathname.startsWith('/learn')) {
    return { allowed: true };
  }

  return { allowed: true };
}

export function canAccessLearnerRecord(
  actor: Pick<UserProfile, 'id' | 'role' | 'organizationId'>,
  targetLearner: Pick<UserProfile, 'id' | 'organizationId'>
): boolean {
  if (actor.role === 'super_admin') return true;
  if (actor.id === targetLearner.id) return true;
  if (
    actor.role === 'manager' &&
    actor.organizationId &&
    actor.organizationId === targetLearner.organizationId
  ) {
    return true;
  }
  return false;
}

export function canEditCourse(
  actor: Pick<UserProfile, 'id' | 'role'>,
  course: Pick<CourseRecord, 'instructorId'>
): boolean {
  if (actor.role === 'super_admin') return true;
  if (actor.role === 'instructor' && course.instructorId === actor.id) return true;
  return false;
}

export function canPublishCourse(actor: Pick<UserProfile, 'role'>): boolean {
  return actor.role === 'super_admin';
}

/**
 * 3. Learning Progress & Enrollment Calculation
 */
export function calculateCourseProgress(
  course: Pick<CourseRecord, 'sections'>,
  completedLessonIds: string[]
): {
  totalLessons: number;
  completedCount: number;
  progressPercent: number;
  allLessonsCompleted: boolean;
} {
  const validLessonIds = new Set<string>();
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      validLessonIds.add(lesson.id);
    }
  }

  const totalLessons = validLessonIds.size;
  if (totalLessons === 0) {
    return {
      totalLessons: 0,
      completedCount: 0,
      progressPercent: 0,
      allLessonsCompleted: false,
    };
  }

  const uniqueCompleted = new Set(
    completedLessonIds.filter((id) => validLessonIds.has(id))
  );
  const completedCount = uniqueCompleted.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return {
    totalLessons,
    completedCount,
    progressPercent,
    allLessonsCompleted: completedCount === totalLessons,
  };
}

/**
 * 4. Assessment Answer-Key Protection & Server-Side Grading
 */
export function sanitizeAssessmentForClient(
  assessment: AssessmentRecord
): SanitizedAssessment {
  return {
    id: assessment.id,
    courseId: assessment.courseId,
    courseTitle: assessment.courseTitle,
    title: assessment.title,
    description: assessment.description,
    passingScore: assessment.passingScore,
    maxAttempts: assessment.maxAttempts,
    timeLimitMinutes: assessment.timeLimitMinutes,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: q.options ? q.options.map((o) => ({ id: o.id, text: o.text })) : undefined,
      points: q.points,
    })),
  };
}

export interface SubmissionAnswerMap {
  [questionId: string]: string | string[];
}

export interface GradedQuestionResult {
  questionId: string;
  correct: boolean;
  earnedPoints: number;
  maxPoints: number;
  explanation: string;
}

export interface GradedAssessmentOutput {
  allowed: boolean;
  error?: string;
  scorePercent: number;
  earnedPoints: number;
  totalPoints: number;
  passed: boolean;
  attemptNumber: number;
  remainingAttempts: number;
  questionResults: GradedQuestionResult[];
}

export function gradeAssessmentOnServer(
  assessment: AssessmentRecord,
  answers: SubmissionAnswerMap,
  previousAttemptCount: number
): GradedAssessmentOutput {
  if (previousAttemptCount >= assessment.maxAttempts) {
    return {
      allowed: false,
      error: `Maximum attempt limit (${assessment.maxAttempts}) reached for this assessment.`,
      scorePercent: 0,
      earnedPoints: 0,
      totalPoints: 0,
      passed: false,
      attemptNumber: previousAttemptCount,
      remainingAttempts: 0,
      questionResults: [],
    };
  }

  let earnedPoints = 0;
  let totalPoints = 0;
  const questionResults: GradedQuestionResult[] = [];

  for (const question of assessment.questions) {
    totalPoints += question.points;
    const rawSubmitted = answers[question.id];
    let isCorrect = false;

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      const submittedId = typeof rawSubmitted === 'string' ? rawSubmitted.trim() : '';
      const expectedId = question.correctOptionIds?.[0] ?? '';
      isCorrect = submittedId !== '' && submittedId === expectedId;
    } else if (question.type === 'multiple_select') {
      const submittedIds = Array.isArray(rawSubmitted)
        ? [...rawSubmitted].sort()
        : [];
      const expectedIds = [...(question.correctOptionIds ?? [])].sort();
      isCorrect =
        submittedIds.length === expectedIds.length &&
        submittedIds.every((val, idx) => val === expectedIds[idx]);
    } else if (question.type === 'short_answer') {
      const submittedText =
        typeof rawSubmitted === 'string' ? rawSubmitted.trim().toLowerCase() : '';
      const accepted = (question.acceptedAnswers ?? []).map((a) =>
        a.trim().toLowerCase()
      );
      isCorrect = submittedText !== '' && accepted.includes(submittedText);
    }

    const earned = isCorrect ? question.points : 0;
    earnedPoints += earned;
    questionResults.push({
      questionId: question.id,
      correct: isCorrect,
      earnedPoints: earned,
      maxPoints: question.points,
      explanation: question.explanation,
    });
  }

  const scorePercent =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercent >= assessment.passingScore;
  const attemptNumber = previousAttemptCount + 1;

  return {
    allowed: true,
    scorePercent,
    earnedPoints,
    totalPoints,
    passed,
    attemptNumber,
    remainingAttempts: Math.max(0, assessment.maxAttempts - attemptNumber),
    questionResults,
  };
}

/**
 * 5. Certificate Eligibility & Verification
 */
export function evaluateCertificateEligibility(params: {
  course: Pick<CourseRecord, 'certificateEligible' | 'passingScore' | 'sections'>;
  completedLessonIds: string[];
  assessmentPassed: boolean;
  bestScore?: number;
}): { eligible: boolean; reason?: string } {
  if (!params.course.certificateEligible) {
    return { eligible: false, reason: 'This course does not issue a certificate.' };
  }

  const progress = calculateCourseProgress(params.course, params.completedLessonIds);
  if (!progress.allLessonsCompleted) {
    return {
      eligible: false,
      reason: `All course lessons must be completed (${progress.completedCount}/${progress.totalLessons} completed).`,
    };
  }

  if (!params.assessmentPassed) {
    return {
      eligible: false,
      reason: 'Required course assessment must be passed before certificate issuance.',
    };
  }

  if (
    typeof params.bestScore === 'number' &&
    params.bestScore < params.course.passingScore
  ) {
    return {
      eligible: false,
      reason: `Minimum passing score of ${params.course.passingScore}% required.`,
    };
  }

  return { eligible: true };
}

export function verifyCertificateRecord(
  certificates: CertificateRecord[],
  queryCode: string
): {
  verified: boolean;
  status: 'valid' | 'revoked' | 'not_found';
  certificate?: CertificateRecord;
  message: string;
} {
  const normalized = queryCode.trim().toUpperCase();
  if (!normalized) {
    return {
      verified: false,
      status: 'not_found',
      message: 'Please enter a certificate verification number.',
    };
  }

  const found = certificates.find(
    (c) => c.certificateNumber.toUpperCase() === normalized || c.id.toUpperCase() === normalized
  );

  if (!found) {
    return {
      verified: false,
      status: 'not_found',
      message: `No certificate matching identifier "${normalized}" was found in Learning Hub records.`,
    };
  }

  if (found.status === 'revoked') {
    return {
      verified: false,
      status: 'revoked',
      certificate: found,
      message: `Certificate ${found.certificateNumber} was revoked on ${found.revokedAt || 'record'}.`,
    };
  }

  return {
    verified: true,
    status: 'valid',
    certificate: found,
    message: `Certificate ${found.certificateNumber} is authentic and active, issued by ${BRAND.issuingAuthority}.`,
  };
}

/**
 * 6. Corporate Training Needs Analysis (TNA) & Competency Gap Calculation
 */
export function calculateCompetencyGap(
  expectedLevel: number,
  currentLevel: number
): {
  gap: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  needsIntervention: boolean;
} {
  const clampedExpected = Math.max(1, Math.min(5, Math.round(expectedLevel)));
  const clampedCurrent = Math.max(1, Math.min(5, Math.round(currentLevel)));
  const gap = Math.max(0, clampedExpected - clampedCurrent);

  let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (gap >= 3) {
    priority = 'Critical';
  } else if (gap === 2) {
    priority = 'High';
  } else if (gap === 1) {
    priority = 'Medium';
  }

  return {
    gap,
    priority,
    needsIntervention: gap > 0,
  };
}
