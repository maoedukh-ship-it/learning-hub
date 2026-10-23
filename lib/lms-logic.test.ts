import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canRegisterPublicly,
  validateAdminUserProvisioning,
  resolveSafeRoleForSelfUpdate,
  canAccessPortalRoute,
  canAccessLearnerRecord,
  canEditCourse,
  canPublishCourse,
  calculateCourseProgress,
  sanitizeAssessmentForClient,
  gradeAssessmentOnServer,
  evaluateCertificateEligibility,
  verifyCertificateRecord,
  calculateCompetencyGap,
  AssessmentRecord,
  CertificateRecord,
  CourseRecord,
} from './lms-logic';
import { BRAND } from './brand';

test('Brand identity and initial System Admin profile match specification', () => {
  assert.equal(BRAND.name, 'Learning Hub');
  assert.equal(BRAND.tagline, 'Learn • Grow • Achieve');
  assert.equal(BRAND.initialAdmin.fullName, 'System Admin');
  assert.equal(BRAND.initialAdmin.email, 'learning@wing-shop.com');
  assert.equal(BRAND.initialAdmin.role, 'super_admin');
  assert.equal(BRAND.colors.deepNavy, '#0B1F3A');
  assert.equal(BRAND.colors.primaryBlue, '#2563EB');
});

test('Authentication: Public learner registration is strictly blocked', () => {
  const result = canRegisterPublicly();
  assert.equal(result.allowed, false);
  assert.match(result.reason, /disabled/i);
});

test('Authorization: Only active Super Admins can provision new learner accounts', () => {
  const superAdmin = { id: 'admin-1', role: 'super_admin' as const, status: 'active' as const };
  const learner = { id: 'user-1', role: 'learner' as const, status: 'active' as const };
  const instructor = { id: 'inst-1', role: 'instructor' as const, status: 'active' as const };

  // Learner cannot create users
  const learnerAttempt = validateAdminUserProvisioning(learner, {
    fullName: 'New Learner',
    email: 'new@company.com',
    existingEmails: [],
  });
  assert.equal(learnerAttempt.valid, false);

  // Instructor cannot create users
  const instructorAttempt = validateAdminUserProvisioning(instructor, {
    fullName: 'New Learner',
    email: 'new@company.com',
    existingEmails: [],
  });
  assert.equal(instructorAttempt.valid, false);

  // Super Admin can create learner
  const adminAttempt = validateAdminUserProvisioning(superAdmin, {
    fullName: 'Sokha Chan',
    email: 'Sokha.Chan@Wing-Shop.com',
    existingEmails: ['learning@wing-shop.com'],
  });
  assert.equal(adminAttempt.valid, true);
  assert.equal(adminAttempt.assignedRole, 'learner');
  assert.equal(adminAttempt.normalizedEmail, 'sokha.chan@wing-shop.com');

  // Duplicate email is rejected
  const duplicateAttempt = validateAdminUserProvisioning(superAdmin, {
    fullName: 'Duplicate Admin',
    email: 'LEARNING@wing-shop.com',
    existingEmails: ['learning@wing-shop.com'],
  });
  assert.equal(duplicateAttempt.valid, false);
});

test('Authorization: Learners cannot elevate their own role or access admin/instructor/manager portals', () => {
  const learner = { id: 'learner-1', role: 'learner' as const, status: 'active' as const, organizationId: 'org-1' };
  const otherLearner = { id: 'learner-2', role: 'learner' as const, status: 'active' as const, organizationId: 'org-1' };
  const manager = { id: 'mgr-1', role: 'manager' as const, status: 'active' as const, organizationId: 'org-1' };
  const otherOrgLearner = { id: 'learner-3', role: 'learner' as const, status: 'active' as const, organizationId: 'org-2' };

  // Self role update check
  const escalation = resolveSafeRoleForSelfUpdate(learner, 'super_admin');
  assert.equal(escalation.allowed, false);
  assert.equal(escalation.role, 'learner');

  // Portal route protection
  assert.equal(canAccessPortalRoute(null, '/learn/dashboard').allowed, false);
  assert.equal(canAccessPortalRoute(learner, '/learn/dashboard').allowed, true);
  assert.equal(canAccessPortalRoute(learner, '/admin/dashboard').allowed, false);
  assert.equal(canAccessPortalRoute(learner, '/instructor/courses').allowed, false);
  assert.equal(canAccessPortalRoute(learner, '/organization/dashboard').allowed, false);

  // Private learner record isolation
  assert.equal(canAccessLearnerRecord(learner, learner), true);
  assert.equal(canAccessLearnerRecord(learner, otherLearner), false);
  assert.equal(canAccessLearnerRecord(manager, learner), true);
  assert.equal(canAccessLearnerRecord(manager, otherOrgLearner), false);
});

test('Authorization: Instructors can only edit their own courses and cannot publish directly without Super Admin', () => {
  const instructor1 = { id: 'inst-1', role: 'instructor' as const };
  const instructor2 = { id: 'inst-2', role: 'instructor' as const };
  const superAdmin = { id: 'admin-1', role: 'super_admin' as const };
  const course = { instructorId: 'inst-1' };

  assert.equal(canEditCourse(instructor1, course), true);
  assert.equal(canEditCourse(instructor2, course), false);
  assert.equal(canEditCourse(superAdmin, course), true);

  assert.equal(canPublishCourse(instructor1), false);
  assert.equal(canPublishCourse(superAdmin), true);
});

test('Learning Workflow: Course progress is calculated strictly from validated lesson completions', () => {
  const mockCourse: Pick<CourseRecord, 'sections'> = {
    sections: [
      {
        id: 'sec-1',
        courseId: 'c-1',
        title: 'Section 1',
        orderIndex: 1,
        lessons: [
          {
            id: 'l-1',
            sectionId: 'sec-1',
            courseId: 'c-1',
            title: 'Lesson 1',
            type: 'video',
            durationMinutes: 15,
            orderIndex: 1,
            content: 'Intro',
            resources: [],
          },
          {
            id: 'l-2',
            sectionId: 'sec-1',
            courseId: 'c-1',
            title: 'Lesson 2',
            type: 'reading',
            durationMinutes: 20,
            orderIndex: 2,
            content: 'Reading',
            resources: [],
          },
        ],
      },
    ],
  };

  // Ignore invalid or duplicate lesson IDs
  const partial = calculateCourseProgress(mockCourse, ['l-1', 'l-1', 'fake-lesson']);
  assert.equal(partial.totalLessons, 2);
  assert.equal(partial.completedCount, 1);
  assert.equal(partial.progressPercent, 50);
  assert.equal(partial.allLessonsCompleted, false);

  const complete = calculateCourseProgress(mockCourse, ['l-1', 'l-2']);
  assert.equal(complete.progressPercent, 100);
  assert.equal(complete.allLessonsCompleted, true);
});

test('Assessments: Answer keys are stripped for client and scored accurately on the server', () => {
  const assessment: AssessmentRecord = {
    id: 'a-1',
    courseId: 'c-1',
    courseTitle: 'Cybersecurity Foundations',
    title: 'Security Exam',
    description: 'Final exam',
    passingScore: 75,
    maxAttempts: 2,
    timeLimitMinutes: 30,
    questions: [
      {
        id: 'q-1',
        type: 'multiple_choice',
        prompt: 'Which protocol encrypts web traffic?',
        options: [
          { id: 'o-1', text: 'HTTP' },
          { id: 'o-2', text: 'HTTPS (TLS)' },
        ],
        correctOptionIds: ['o-2'],
        points: 50,
        explanation: 'HTTPS uses TLS encryption.',
      },
      {
        id: 'q-2',
        type: 'multiple_select',
        prompt: 'Select all valid MFA factors:',
        options: [
          { id: 'm-1', text: 'Hardware security key' },
          { id: 'm-2', text: 'Authenticator TOTP' },
          { id: 'm-3', text: 'Plaintext sticky note' },
        ],
        correctOptionIds: ['m-1', 'm-2'],
        points: 50,
        explanation: 'Hardware keys and TOTP are valid MFA factors.',
      },
    ],
  };

  const sanitized = sanitizeAssessmentForClient(assessment);
  assert.equal('correctOptionIds' in sanitized.questions[0], false);

  // Passing attempt
  const passResult = gradeAssessmentOnServer(
    assessment,
    { 'q-1': 'o-2', 'q-2': ['m-2', 'm-1'] },
    0
  );
  assert.equal(passResult.allowed, true);
  assert.equal(passResult.scorePercent, 100);
  assert.equal(passResult.passed, true);
  assert.equal(passResult.remainingAttempts, 1);

  // Exceeding attempt limit is blocked
  const blockedAttempt = gradeAssessmentOnServer(
    assessment,
    { 'q-1': 'o-2', 'q-2': ['m-1', 'm-2'] },
    2
  );
  assert.equal(blockedAttempt.allowed, false);
});

test('Certificates: Issued only when all lessons and assessments are completed, and verified accurately', () => {
  const course = {
    certificateEligible: true,
    passingScore: 80,
    sections: [
      {
        id: 's1',
        courseId: 'c1',
        title: 'S1',
        orderIndex: 1,
        lessons: [
          {
            id: 'l1',
            sectionId: 's1',
            courseId: 'c1',
            title: 'L1',
            type: 'video' as const,
            durationMinutes: 10,
            orderIndex: 1,
            content: '',
            resources: [],
          },
        ],
      },
    ],
  };

  assert.equal(
    evaluateCertificateEligibility({
      course,
      completedLessonIds: [],
      assessmentPassed: true,
      bestScore: 90,
    }).eligible,
    false
  );

  assert.equal(
    evaluateCertificateEligibility({
      course,
      completedLessonIds: ['l1'],
      assessmentPassed: false,
      bestScore: 60,
    }).eligible,
    false
  );

  assert.equal(
    evaluateCertificateEligibility({
      course,
      completedLessonIds: ['l1'],
      assessmentPassed: true,
      bestScore: 90,
    }).eligible,
    true
  );

  const certs: CertificateRecord[] = [
    {
      id: 'cert-1',
      certificateNumber: 'LH-2026-0001',
      userId: 'u-1',
      learnerName: 'Dara Kem',
      courseId: 'c-1',
      courseTitle: 'Enterprise Cybersecurity Foundations',
      issuedAt: '2026-10-15',
      issuingAuthority: BRAND.issuingAuthority,
      signatory: BRAND.authorizedSignatory,
      status: 'valid',
    },
    {
      id: 'cert-2',
      certificateNumber: 'LH-2026-0099',
      userId: 'u-2',
      learnerName: 'Revoked User',
      courseId: 'c-1',
      courseTitle: 'Enterprise Cybersecurity Foundations',
      issuedAt: '2026-09-01',
      issuingAuthority: BRAND.issuingAuthority,
      signatory: BRAND.authorizedSignatory,
      status: 'revoked',
      revokedAt: '2026-10-01',
    },
  ];

  const validCheck = verifyCertificateRecord(certs, 'lh-2026-0001');
  assert.equal(validCheck.verified, true);
  assert.equal(validCheck.status, 'valid');

  const revokedCheck = verifyCertificateRecord(certs, 'LH-2026-0099');
  assert.equal(revokedCheck.verified, false);
  assert.equal(revokedCheck.status, 'revoked');
});

test('Corporate TNA: Competency gap and priority calculation', () => {
  const criticalGap = calculateCompetencyGap(5, 2);
  assert.equal(criticalGap.gap, 3);
  assert.equal(criticalGap.priority, 'Critical');
  assert.equal(criticalGap.needsIntervention, true);

  const noGap = calculateCompetencyGap(4, 4);
  assert.equal(noGap.gap, 0);
  assert.equal(noGap.priority, 'Low');
  assert.equal(noGap.needsIntervention, false);
});
