import { NextRequest, NextResponse } from 'next/server';
import {
  appendAuditLog,
  completeLessonAndRecalculate,
  createTNARecordInStore,
  readDatabase,
  submitAssessmentAndRecord,
  writeDatabase,
} from '@/lib/db-store';
import {
  canEditCourse,
  canPublishCourse,
  canRegisterPublicly,
  CourseRecord,
  sanitizeAssessmentForClient,
  validateAdminUserProvisioning,
  verifyCertificateRecord,
} from '@/lib/lms-logic';
import { UserRole } from '@/lib/brand';

export async function GET(req: NextRequest) {
  const db = readDatabase();
  const { searchParams } = new URL(req.url);
  const verifyCode = searchParams.get('verifyCertificate');

  if (verifyCode !== null) {
    const result = verifyCertificateRecord(db.certificates, verifyCode);
    return NextResponse.json(result);
  }

  const currentUser =
    db.users.find((u) => u.id === db.currentSessionUserId) || null;

  // Strip answer keys from assessments before returning to client
  const sanitizedAssessments = db.assessments.map((a) =>
    sanitizeAssessmentForClient(a)
  );

  return NextResponse.json({
    currentUser,
    users: db.users,
    categories: db.categories,
    courses: db.courses,
    learningPaths: db.learningPaths,
    assessments: sanitizedAssessments,
    assessmentAttempts: db.assessmentAttempts,
    enrollments: db.enrollments,
    certificates: db.certificates,
    organizations: db.organizations,
    departments: db.departments,
    teams: db.teams,
    tnaRecords: db.tnaRecords,
    notifications: db.notifications,
    auditLogs: db.auditLogs,
    bookmarks: db.bookmarks,
    platformSettings: db.platformSettings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = readDatabase();
    const currentUser =
      db.users.find((u) => u.id === db.currentSessionUserId) || null;

    if (action === 'attempt_public_register') {
      const check = canRegisterPublicly();
      return NextResponse.json({ error: check.reason }, { status: 403 });
    }

    if (action === 'switch_session') {
      const { userId, email } = body;
      let target = db.users.find(
        (u) =>
          (userId && u.id === userId) ||
          (email && u.email.toLowerCase() === String(email).trim().toLowerCase())
      );
      if (!target) {
        return NextResponse.json(
          { error: 'Invalid credentials or unrecognized account identifier.' },
          { status: 401 }
        );
      }
      if (target.status === 'suspended') {
        return NextResponse.json(
          { error: 'This account has been suspended by an administrator.' },
          { status: 403 }
        );
      }
      target.lastLoginAt = new Date().toISOString();
      db.currentSessionUserId = target.id;
      writeDatabase(db);
      return NextResponse.json({ currentUser: target });
    }

    if (action === 'logout') {
      db.currentSessionUserId = '';
      writeDatabase(db);
      return NextResponse.json({ currentUser: null });
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (action === 'admin_create_user') {
      const {
        fullName,
        email,
        role,
        employeeId,
        departmentId,
        organizationId,
        jobTitle,
      } = body;

      const validation = validateAdminUserProvisioning(currentUser, {
        fullName: String(fullName || ''),
        email: String(email || ''),
        requestedRole: role as UserRole,
        existingEmails: db.users.map((u) => u.email),
      });

      if (!validation.valid || !validation.normalizedEmail || !validation.assignedRole) {
        return NextResponse.json(
          { error: validation.error || 'Invalid user data.' },
          { status: 400 }
        );
      }

      const newUser = {
        id: `user-${Date.now()}`,
        fullName: String(fullName).trim(),
        email: validation.normalizedEmail,
        role: validation.assignedRole,
        status: 'active' as const,
        employeeId: employeeId ? String(employeeId).trim() : `EMP-2026-${db.users.length + 101}`,
        organizationId: organizationId || 'org-wing-1',
        departmentId: departmentId || 'dept-eng',
        teamId: 'team-platform',
        jobTitle: jobTitle ? String(jobTitle).trim() : 'Enterprise Specialist',
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      };

      db.users.unshift(newUser);
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        eventType: 'invitation',
        title: 'Welcome to Learning Hub',
        message: `Your account was provisioned by ${currentUser.fullName}. Please review your assigned onboarding curriculum.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      appendAuditLog(
        db,
        currentUser,
        'CREATE_USER_ACCOUNT',
        'user',
        newUser.id,
        `Provisioned ${validation.assignedRole} account for ${newUser.fullName} (${newUser.email}).`
      );
      writeDatabase(db);
      return NextResponse.json({ user: newUser });
    }

    if (action === 'admin_toggle_user_status') {
      if (currentUser.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Forbidden: Super Admin privileges required.' },
          { status: 403 }
        );
      }
      const { targetUserId } = body;
      const target = db.users.find((u) => u.id === targetUserId);
      if (!target) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }
      if (target.id === currentUser.id) {
        return NextResponse.json(
          { error: 'Cannot suspend your own active Super Admin account.' },
          { status: 400 }
        );
      }
      target.status = target.status === 'active' ? 'suspended' : 'active';
      appendAuditLog(
        db,
        currentUser,
        target.status === 'suspended' ? 'SUSPEND_USER' : 'REACTIVATE_USER',
        'user',
        target.id,
        `Changed status of ${target.fullName} (${target.email}) to ${target.status}.`
      );
      writeDatabase(db);
      return NextResponse.json({ user: target });
    }

    if (action === 'admin_assign_training') {
      if (currentUser.role !== 'super_admin' && currentUser.role !== 'manager') {
        return NextResponse.json(
          { error: 'Forbidden: Only administrators or training managers can assign mandatory training.' },
          { status: 403 }
        );
      }
      const { userId, courseId, dueDate, isMandatory } = body;
      const targetUser = db.users.find((u) => u.id === userId);
      const course = db.courses.find((c) => c.id === courseId);
      if (!targetUser || !course) {
        return NextResponse.json({ error: 'Target learner or course not found.' }, { status: 404 });
      }

      let enrollment = db.enrollments.find(
        (e) => e.userId === userId && e.courseId === courseId
      );
      if (!enrollment) {
        enrollment = {
          id: `enr-${Date.now()}`,
          userId,
          courseId,
          enrolledAt: new Date().toISOString(),
          status: 'not_started',
          completedLessonIds: [],
          progressPercent: 0,
          assessmentPassed: false,
          assignedBy: currentUser.id,
          dueDate: dueDate || '2026-11-30',
          isMandatory: Boolean(isMandatory ?? true),
        };
        db.enrollments.unshift(enrollment);
      } else {
        enrollment.dueDate = dueDate || enrollment.dueDate || '2026-11-30';
        enrollment.isMandatory = Boolean(isMandatory ?? true);
        enrollment.assignedBy = currentUser.id;
      }

      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId,
        eventType: 'assignment',
        title: `New Training Assigned: ${course.title}`,
        message: `${currentUser.fullName} assigned you "${course.title}" with a required completion date of ${enrollment.dueDate}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      appendAuditLog(
        db,
        currentUser,
        'ASSIGN_MANDATORY_TRAINING',
        'enrollment',
        enrollment.id,
        `Assigned "${course.title}" to ${targetUser.fullName} (Due: ${enrollment.dueDate}).`
      );
      writeDatabase(db);
      return NextResponse.json({ enrollment });
    }

    if (action === 'enroll_course') {
      const { courseId } = body;
      const course = db.courses.find((c) => c.id === courseId);
      if (!course || course.status !== 'published') {
        return NextResponse.json(
          { error: 'Course is not available for enrollment.' },
          { status: 400 }
        );
      }
      let existing = db.enrollments.find(
        (e) => e.userId === currentUser.id && e.courseId === courseId
      );
      if (!existing) {
        existing = {
          id: `enr-${Date.now()}`,
          userId: currentUser.id,
          courseId,
          enrolledAt: new Date().toISOString(),
          status: 'in_progress',
          completedLessonIds: [],
          progressPercent: 0,
          assessmentPassed: false,
        };
        db.enrollments.unshift(existing);
        writeDatabase(db);
      }
      return NextResponse.json({ enrollment: existing });
    }

    if (action === 'complete_lesson') {
      const { courseId, lessonId } = body;
      const result = completeLessonAndRecalculate(
        db,
        currentUser.id,
        courseId,
        lessonId
      );
      return NextResponse.json(result);
    }

    if (action === 'submit_assessment') {
      const { assessmentId, answers } = body;
      const result = submitAssessmentAndRecord(
        db,
        currentUser.id,
        assessmentId,
        answers || {}
      );
      if (!result.graded.allowed) {
        return NextResponse.json({ error: result.graded.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === 'create_course') {
      if (currentUser.role !== 'super_admin' && currentUser.role !== 'instructor') {
        return NextResponse.json(
          { error: 'Forbidden: Only instructors or administrators can create courses.' },
          { status: 403 }
        );
      }
      const {
        title,
        shortDescription,
        fullDescription,
        categoryId,
        level,
        durationHours,
        passingScore,
      } = body;

      if (!title || String(title).trim().length < 4) {
        return NextResponse.json(
          { error: 'Course title must be at least 4 characters.' },
          { status: 400 }
        );
      }

      const category =
        db.categories.find((c) => c.id === categoryId) || db.categories[0];
      const slug = String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const courseId = `course-${Date.now()}`;
      const sectionId = `sec-${Date.now()}`;
      const newCourse: CourseRecord = {
        id: courseId,
        slug: `${slug}-${Date.now().toString().slice(-3)}`,
        title: String(title).trim(),
        shortDescription:
          String(shortDescription || '').trim() ||
          'Structured enterprise training module.',
        fullDescription:
          String(fullDescription || '').trim() ||
          'Comprehensive curriculum designed for professional competency development.',
        categoryId: category.id,
        categoryName: category.name,
        instructorId: currentUser.id,
        instructorName: currentUser.fullName,
        instructorTitle: currentUser.jobTitle || 'Senior Enterprise Instructor',
        level: level || 'Intermediate',
        durationHours: Number(durationHours) || 4,
        language: 'English',
        status: currentUser.role === 'super_admin' ? 'published' : 'pending_review',
        publishedAt:
          currentUser.role === 'super_admin'
            ? new Date().toISOString().slice(0, 10)
            : undefined,
        passingScore: Number(passingScore) || 80,
        certificateEligible: true,
        thumbnailTheme: 'navy',
        objectives: [
          'Master core domain concepts and operational procedures',
          'Apply governance and verification standards in daily workflows',
        ],
        prerequisites: ['Standard corporate access'],
        sections: [
          {
            id: sectionId,
            courseId,
            title: 'Module 1: Core Foundations & Practical Execution',
            orderIndex: 1,
            lessons: [
              {
                id: `les-${Date.now()}`,
                sectionId,
                courseId,
                title: '1.1 Executive Overview & Operational Standards',
                type: 'video',
                durationMinutes: 20,
                orderIndex: 1,
                content:
                  'Welcome to this training module. Review the key operational principles and complete the accompanying exercises.',
                resources: [],
              },
            ],
          },
        ],
      };

      db.courses.unshift(newCourse);
      appendAuditLog(
        db,
        currentUser,
        'CREATE_COURSE',
        'course',
        newCourse.id,
        `Created course "${newCourse.title}" with status ${newCourse.status}.`
      );
      writeDatabase(db);
      return NextResponse.json({ course: newCourse });
    }

    if (action === 'add_curriculum_lesson') {
      const { courseId, sectionTitle, lessonTitle, lessonType, durationMinutes, content } =
        body;
      const course = db.courses.find((c) => c.id === courseId);
      if (!course) {
        return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
      }
      if (!canEditCourse(currentUser, course)) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to edit this course.' },
          { status: 403 }
        );
      }

      let targetSection = course.sections.find(
        (s) => s.title.toLowerCase() === String(sectionTitle || '').trim().toLowerCase()
      );
      if (!targetSection) {
        targetSection = {
          id: `sec-${Date.now()}`,
          courseId: course.id,
          title: String(sectionTitle || `Module ${course.sections.length + 1}`).trim(),
          orderIndex: course.sections.length + 1,
          lessons: [],
        };
        course.sections.push(targetSection);
      }

      const newLesson = {
        id: `les-${Date.now()}`,
        sectionId: targetSection.id,
        courseId: course.id,
        title: String(lessonTitle || 'New Lesson').trim(),
        type: (lessonType || 'reading') as 'video' | 'reading' | 'document' | 'quiz',
        durationMinutes: Number(durationMinutes) || 15,
        orderIndex: targetSection.lessons.length + 1,
        content:
          String(content || '').trim() ||
          'Structured lesson content and reference guidance.',
        resources: [],
      };
      targetSection.lessons.push(newLesson);

      appendAuditLog(
        db,
        currentUser,
        'UPDATE_COURSE_CURRICULUM',
        'course',
        course.id,
        `Added lesson "${newLesson.title}" to "${course.title}".`
      );
      writeDatabase(db);
      return NextResponse.json({ course });
    }

    if (action === 'moderate_course') {
      if (!canPublishCourse(currentUser)) {
        return NextResponse.json(
          { error: 'Forbidden: Only Super Admins may approve, publish, or archive courses.' },
          { status: 403 }
        );
      }
      const { courseId, newStatus } = body;
      const course = db.courses.find((c) => c.id === courseId);
      if (!course) {
        return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
      }
      course.status = newStatus;
      if (newStatus === 'published') {
        course.publishedAt = new Date().toISOString().slice(0, 10);
      }
      appendAuditLog(
        db,
        currentUser,
        `COURSE_STATUS_${String(newStatus).toUpperCase()}`,
        'course',
        course.id,
        `Updated course "${course.title}" status to ${newStatus}.`
      );
      writeDatabase(db);
      return NextResponse.json({ course });
    }

    if (action === 'revoke_certificate') {
      if (currentUser.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Forbidden: Only Super Admins can revoke certificates.' },
          { status: 403 }
        );
      }
      const { certificateId, reason } = body;
      const cert = db.certificates.find((c) => c.id === certificateId);
      if (!cert) {
        return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
      }
      cert.status = 'revoked';
      cert.revokedAt = new Date().toISOString().slice(0, 10);
      cert.revokedReason = String(reason || 'Administrative compliance revocation');
      appendAuditLog(
        db,
        currentUser,
        'REVOKE_CERTIFICATE',
        'certificate',
        cert.certificateNumber,
        `Revoked certificate ${cert.certificateNumber} (${cert.learnerName}): ${cert.revokedReason}`
      );
      writeDatabase(db);
      return NextResponse.json({ certificate: cert });
    }

    if (action === 'create_tna_record') {
      if (currentUser.role !== 'super_admin' && currentUser.role !== 'manager') {
        return NextResponse.json(
          { error: 'Forbidden: Only Super Admins or Organization Managers can create TNA records.' },
          { status: 403 }
        );
      }
      const record = createTNARecordInStore(db, currentUser, {
        employeeId: body.employeeId,
        competencyName: body.competencyName,
        expectedLevel: Number(body.expectedLevel),
        currentLevel: Number(body.currentLevel),
        recommendedCourseId: body.recommendedCourseId,
        reviewDate: body.reviewDate,
      });
      return NextResponse.json({ tnaRecord: record });
    }

    if (action === 'toggle_bookmark') {
      const { courseId, lessonId } = body;
      const idx = db.bookmarks.findIndex(
        (b) => b.userId === currentUser.id && b.courseId === courseId
      );
      if (idx >= 0) {
        db.bookmarks.splice(idx, 1);
      } else {
        db.bookmarks.unshift({
          userId: currentUser.id,
          courseId,
          lessonId,
          createdAt: new Date().toISOString(),
        });
      }
      writeDatabase(db);
      return NextResponse.json({ bookmarks: db.bookmarks });
    }

    if (action === 'mark_notifications_read') {
      for (const n of db.notifications) {
        if (n.userId === currentUser.id) {
          n.isRead = true;
        }
      }
      writeDatabase(db);
      return NextResponse.json({ notifications: db.notifications });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
