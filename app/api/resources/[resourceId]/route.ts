import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/db-store';
import { BRAND } from '@/lib/brand';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await context.params;
  const db = readDatabase();
  const currentUser = db.users.find((u) => u.id === db.currentSessionUserId);

  if (!currentUser) {
    return NextResponse.json(
      { error: 'Unauthorized: Sign in required to download protected learning resources.' },
      { status: 401 }
    );
  }

  let foundResource: { id: string; title: string; fileType: string; courseTitle: string } | null =
    null;

  for (const course of db.courses) {
    for (const sec of course.sections) {
      for (const les of sec.lessons) {
        const res = les.resources.find((r) => r.id === resourceId);
        if (res) {
          foundResource = { ...res, courseTitle: course.title };
          break;
        }
      }
    }
  }

  const content = [
    `====================================================================`,
    `${BRAND.name.toUpperCase()} — OFFICIAL LEARNING RESOURCE`,
    `Tagline: ${BRAND.tagline}`,
    `====================================================================`,
    `Resource ID: ${resourceId}`,
    `Title: ${foundResource?.title || 'Enterprise Training Reference Guide'}`,
    `Course: ${foundResource?.courseTitle || 'Learning Hub Curriculum'}`,
    `Authorized Learner: ${currentUser.fullName} (${currentUser.email})`,
    `Downloaded At: ${new Date().toISOString()}`,
    `--------------------------------------------------------------------`,
    `1. Zero-Trust Identity & Access Governance`,
    `   - Public self-registration is disabled across all portals.`,
    `   - Separate user profile identity from server-assigned roles.`,
    `   - Enforce Row-Level Security (RLS) on all PostgreSQL tables.`,
    ``,
    `2. Compliance & Audit Verification`,
    `   - Every administrative action is recorded in append-only audit logs.`,
    `   - Certificates require 100% lesson completion and passing exam score.`,
    `====================================================================`,
  ].join('\n');

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="LearningHub-${resourceId}.txt"`,
    },
  });
}
