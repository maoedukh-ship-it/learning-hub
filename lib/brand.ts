export const BRAND = {
  name: 'Learning Hub',
  tagline: 'Learn • Grow • Achieve',
  description:
    'Enterprise Learning Management System (LMS) and Corporate Training Platform supporting individual skill mastery, employee onboarding, compliance training, assessments, certifications, and Training Needs Analysis (TNA).',
  colors: {
    deepNavy: '#0B1F3A',
    white: '#FFFFFF',
    primaryBlue: '#2563EB',
    lightGray: '#F3F4F6',
    darkText: '#111827',
    secondaryText: '#6B7280',
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
  },
  initialAdmin: {
    fullName: 'System Admin',
    email: 'learning@wing-shop.com',
    role: 'super_admin' as const,
    roleLabel: 'Super Admin',
  },
  supportEmail: 'learning@wing-shop.com',
  issuingAuthority: 'Learning Hub Enterprise Academy',
  authorizedSignatory: 'System Admin — Director of Learning & Development',
} as const;

export type UserRole = 'super_admin' | 'instructor' | 'manager' | 'learner';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  instructor: 'Instructor',
  manager: 'Organization Manager',
  learner: 'Learner',
};

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  super_admin: '/admin/dashboard',
  instructor: '/instructor/dashboard',
  manager: '/organization/dashboard',
  learner: '/learn/dashboard',
};
