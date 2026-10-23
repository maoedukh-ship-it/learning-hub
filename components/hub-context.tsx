'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  CertificateRecord,
  CourseRecord,
  EnrollmentRecord,
  GradedAssessmentOutput,
  SanitizedAssessment,
  SubmissionAnswerMap,
  TNARecord,
  UserProfile,
} from '@/lib/lms-logic';
import {
  AssessmentAttemptRecord,
  AuditLogRecord,
  CategoryRecord,
  DepartmentRecord,
  LearningPathRecord,
  NotificationRecord,
  OrganizationRecord,
  TeamRecord,
} from '@/lib/db-store';
import { UserRole } from '@/lib/brand';
import {
  googleSignIn,
  initAuth,
  logoutGoogle,
} from '@/lib/google-workspace';

interface HubState {
  loading: boolean;
  currentUser: UserProfile | null;
  users: UserProfile[];
  categories: CategoryRecord[];
  courses: CourseRecord[];
  learningPaths: LearningPathRecord[];
  assessments: SanitizedAssessment[];
  assessmentAttempts: AssessmentAttemptRecord[];
  enrollments: EnrollmentRecord[];
  certificates: CertificateRecord[];
  organizations: OrganizationRecord[];
  departments: DepartmentRecord[];
  teams: TeamRecord[];
  tnaRecords: TNARecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
  bookmarks: { userId: string; courseId: string; lessonId?: string; createdAt: string }[];
  platformSettings: {
    publicRegistrationEnabled: false;
    requireStrongPasswords: boolean;
    sessionTimeoutMinutes: number;
    certificateVerificationPublic: boolean;
    muxVideoConfigured: boolean;
    emailProviderConfigured: boolean;
    googleSheetsSyncReady: boolean;
    lastExportedSheetUrl?: string;
  };
  googleEmail: string | null;
  googleToken: string | null;
  refreshHub: () => Promise<void>;
  switchSession: (params: { userId?: string; email?: string }) => Promise<{ ok: boolean; error?: string; user?: UserProfile }>;
  logoutSession: () => Promise<void>;
  adminCreateUser: (payload: {
    fullName: string;
    email: string;
    role: UserRole;
    employeeId?: string;
    departmentId?: string;
    organizationId?: string;
    jobTitle?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  adminToggleUserStatus: (targetUserId: string) => Promise<{ ok: boolean; error?: string }>;
  adminAssignTraining: (payload: {
    userId: string;
    courseId: string;
    dueDate: string;
    isMandatory: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  enrollInCourse: (courseId: string) => Promise<{ ok: boolean; error?: string }>;
  completeLesson: (courseId: string, lessonId: string) => Promise<{ ok: boolean; certificate?: CertificateRecord; error?: string }>;
  submitAssessment: (
    assessmentId: string,
    answers: SubmissionAnswerMap
  ) => Promise<{
    ok: boolean;
    graded?: GradedAssessmentOutput;
    certificate?: CertificateRecord;
    error?: string;
  }>;
  createCourse: (payload: {
    title: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    durationHours: number;
    passingScore: number;
  }) => Promise<{ ok: boolean; course?: CourseRecord; error?: string }>;
  addCurriculumLesson: (payload: {
    courseId: string;
    sectionTitle: string;
    lessonTitle: string;
    lessonType: 'video' | 'reading' | 'document' | 'quiz';
    durationMinutes: number;
    content: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  moderateCourse: (
    courseId: string,
    newStatus: 'published' | 'archived' | 'draft' | 'pending_review'
  ) => Promise<{ ok: boolean; error?: string }>;
  revokeCertificate: (certificateId: string, reason: string) => Promise<{ ok: boolean; error?: string }>;
  createTNARecord: (payload: {
    employeeId: string;
    competencyName: string;
    expectedLevel: number;
    currentLevel: number;
    recommendedCourseId: string;
    reviewDate: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  toggleBookmark: (courseId: string, lessonId?: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  connectGoogleSheets: () => Promise<{ ok: boolean; token?: string; error?: string }>;
  disconnectGoogleSheets: () => Promise<void>;
}

const HubContext = createContext<HubState | null>(null);

export function HubProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathRecord[]>([]);
  const [assessments, setAssessments] = useState<SanitizedAssessment[]>([]);
  const [assessmentAttempts, setAssessmentAttempts] = useState<AssessmentAttemptRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [tnaRecords, setTnaRecords] = useState<TNARecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [bookmarks, setBookmarks] = useState<
    { userId: string; courseId: string; lessonId?: string; createdAt: string }[]
  >([]);
  const [platformSettings, setPlatformSettings] = useState<HubState['platformSettings']>({
    publicRegistrationEnabled: false,
    requireStrongPasswords: true,
    sessionTimeoutMinutes: 60,
    certificateVerificationPublic: true,
    muxVideoConfigured: false,
    emailProviderConfigured: false,
    googleSheetsSyncReady: true,
  });

  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  const refreshHub = useCallback(async () => {
    try {
      const res = await fetch('/api/hub', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setCurrentUser(data.currentUser);
      setUsers(data.users || []);
      setCategories(data.categories || []);
      setCourses(data.courses || []);
      setLearningPaths(data.learningPaths || []);
      setAssessments(data.assessments || []);
      setAssessmentAttempts(data.assessmentAttempts || []);
      setEnrollments(data.enrollments || []);
      setCertificates(data.certificates || []);
      setOrganizations(data.organizations || []);
      setDepartments(data.departments || []);
      setTeams(data.teams || []);
      setTnaRecords(data.tnaRecords || []);
      setNotifications(data.notifications || []);
      setAuditLogs(data.auditLogs || []);
      setBookmarks(data.bookmarks || []);
      if (data.platformSettings) {
        setPlatformSettings(data.platformSettings);
      }
    } catch (err) {
      console.error('Failed to load Learning Hub state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHub();
    const unsub = initAuth(
      (user, token) => {
        setGoogleEmail(user.email || 'Connected Google Account');
        setGoogleToken(token);
      },
      () => {
        setGoogleEmail(null);
        setGoogleToken(null);
      }
    );
    return () => unsub();
  }, [refreshHub]);

  const postAction = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/hub', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Operation failed.' };
    }
    await refreshHub();
    return { ok: true, data };
  };

  const switchSession: HubState['switchSession'] = async (params) => {
    const result = await postAction({ action: 'switch_session', ...params });
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, user: result.data.currentUser };
  };

  const logoutSession = async () => {
    await postAction({ action: 'logout' });
  };

  const adminCreateUser: HubState['adminCreateUser'] = async (payload) => {
    const result = await postAction({ action: 'admin_create_user', ...payload });
    return { ok: result.ok, error: result.error };
  };

  const adminToggleUserStatus: HubState['adminToggleUserStatus'] = async (
    targetUserId
  ) => {
    const result = await postAction({
      action: 'admin_toggle_user_status',
      targetUserId,
    });
    return { ok: result.ok, error: result.error };
  };

  const adminAssignTraining: HubState['adminAssignTraining'] = async (payload) => {
    const result = await postAction({
      action: 'admin_assign_training',
      ...payload,
    });
    return { ok: result.ok, error: result.error };
  };

  const enrollInCourse: HubState['enrollInCourse'] = async (courseId) => {
    const result = await postAction({ action: 'enroll_course', courseId });
    return { ok: result.ok, error: result.error };
  };

  const completeLesson: HubState['completeLesson'] = async (
    courseId,
    lessonId
  ) => {
    const result = await postAction({
      action: 'complete_lesson',
      courseId,
      lessonId,
    });
    return {
      ok: result.ok,
      certificate: result.data?.certificate,
      error: result.error,
    };
  };

  const submitAssessment: HubState['submitAssessment'] = async (
    assessmentId,
    answers
  ) => {
    const result = await postAction({
      action: 'submit_assessment',
      assessmentId,
      answers,
    });
    return {
      ok: result.ok,
      graded: result.data?.graded,
      certificate: result.data?.certificate,
      error: result.error,
    };
  };

  const createCourse: HubState['createCourse'] = async (payload) => {
    const result = await postAction({ action: 'create_course', ...payload });
    return {
      ok: result.ok,
      course: result.data?.course,
      error: result.error,
    };
  };

  const addCurriculumLesson: HubState['addCurriculumLesson'] = async (
    payload
  ) => {
    const result = await postAction({
      action: 'add_curriculum_lesson',
      ...payload,
    });
    return { ok: result.ok, error: result.error };
  };

  const moderateCourse: HubState['moderateCourse'] = async (
    courseId,
    newStatus
  ) => {
    const result = await postAction({
      action: 'moderate_course',
      courseId,
      newStatus,
    });
    return { ok: result.ok, error: result.error };
  };

  const revokeCertificate: HubState['revokeCertificate'] = async (
    certificateId,
    reason
  ) => {
    const result = await postAction({
      action: 'revoke_certificate',
      certificateId,
      reason,
    });
    return { ok: result.ok, error: result.error };
  };

  const createTNARecord: HubState['createTNARecord'] = async (payload) => {
    const result = await postAction({
      action: 'create_tna_record',
      ...payload,
    });
    return { ok: result.ok, error: result.error };
  };

  const toggleBookmark: HubState['toggleBookmark'] = async (
    courseId,
    lessonId
  ) => {
    await postAction({ action: 'toggle_bookmark', courseId, lessonId });
  };

  const markNotificationsRead = async () => {
    await postAction({ action: 'mark_notifications_read' });
  };

  const connectGoogleSheets: HubState['connectGoogleSheets'] = async () => {
    try {
      const res = await googleSignIn();
      if (!res) {
        return { ok: false, error: 'Google Sign-In was cancelled.' };
      }
      setGoogleEmail(res.user.email || 'Connected Google Account');
      setGoogleToken(res.accessToken);
      return { ok: true, token: res.accessToken };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Google Sign-In failed.';
      return { ok: false, error: message };
    }
  };

  const disconnectGoogleSheets = async () => {
    await logoutGoogle();
    setGoogleEmail(null);
    setGoogleToken(null);
  };

  return (
    <HubContext.Provider
      value={{
        loading,
        currentUser,
        users,
        categories,
        courses,
        learningPaths,
        assessments,
        assessmentAttempts,
        enrollments,
        certificates,
        organizations,
        departments,
        teams,
        tnaRecords,
        notifications,
        auditLogs,
        bookmarks,
        platformSettings,
        googleEmail,
        googleToken,
        refreshHub,
        switchSession,
        logoutSession,
        adminCreateUser,
        adminToggleUserStatus,
        adminAssignTraining,
        enrollInCourse,
        completeLesson,
        submitAssessment,
        createCourse,
        addCurriculumLesson,
        moderateCourse,
        revokeCertificate,
        createTNARecord,
        toggleBookmark,
        markNotificationsRead,
        connectGoogleSheets,
        disconnectGoogleSheets,
      }}
    >
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  const ctx = useContext(HubContext);
  if (!ctx) {
    throw new Error('useHub must be used inside HubProvider');
  }
  return ctx;
}
