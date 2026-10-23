import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, readDatabase, writeDatabase } from '@/lib/db-store';

/**
 * Server-side Google Sheets API v4 Integration Route
 * Follows workspace-integration skill:
 * - Never hardcodes "Sheet1"; fetches spreadsheet metadata first to identify actual tab names.
 * - Uses Bearer token provided by client-side Google OAuth flow.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Google OAuth Bearer token required.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get('spreadsheetId')?.trim();
  const requestedSheet = searchParams.get('sheetName')?.trim();

  if (!spreadsheetId) {
    return NextResponse.json(
      { error: 'spreadsheetId query parameter is required.' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch spreadsheet metadata to discover actual sheet/tab names
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`,
      {
        headers: { Authorization: authHeader },
      }
    );

    if (!metaRes.ok) {
      const errData = await metaRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errData?.error?.message ||
            `Failed to read Google Sheet metadata (HTTP ${metaRes.status}).`,
        },
        { status: metaRes.status }
      );
    }

    const meta = await metaRes.json();
    const sheetTabs: string[] = (meta.sheets || []).map(
      (s: { properties?: { title?: string } }) => s.properties?.title || 'Tab'
    );
    const activeTab =
      requestedSheet && sheetTabs.includes(requestedSheet)
        ? requestedSheet
        : sheetTabs[0];

    if (!activeTab) {
      return NextResponse.json({
        title: meta.properties?.title || 'Spreadsheet',
        sheetTabs: [],
        activeTab: '',
        values: [],
      });
    }

    // 2. Read values from the discovered active tab
    const range = `${activeTab}!A1:H50`;
    const valRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/${encodeURIComponent(range)}`,
      {
        headers: { Authorization: authHeader },
      }
    );

    const valData = await valRes.json();
    return NextResponse.json({
      title: meta.properties?.title || 'Spreadsheet',
      spreadsheetUrl: meta.spreadsheetUrl,
      sheetTabs,
      activeTab,
      values: valData.values || [],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to communicate with Google Sheets API.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Google OAuth Bearer token required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { mode, spreadsheetId, reportType } = body;
    const db = readDatabase();
    const currentUser =
      db.users.find((u) => u.id === db.currentSessionUserId) || db.users[0];

    // Build rows based on selected reportType
    let rows: string[][] = [];
    let sheetTitle = 'Learning Hub Report';

    if (reportType === 'tna_gaps') {
      sheetTitle = 'Learning Hub — TNA Competency Gaps';
      rows = [
        [
          'Employee Name',
          'Job Role',
          'Department',
          'Competency',
          'Expected Level',
          'Current Level',
          'Skill Gap',
          'Priority',
          'Recommended Intervention',
          'Review Date',
        ],
        ...db.tnaRecords.map((r) => [
          r.employeeName,
          r.jobRole,
          r.departmentName,
          r.competencyName,
          String(r.expectedLevel),
          String(r.currentLevel),
          String(r.gap),
          r.priority,
          r.recommendedCourseTitle,
          r.reviewDate,
        ]),
      ];
    } else {
      sheetTitle = 'Learning Hub — Course Completion & Compliance Report';
      rows = [
        [
          'Learner Name',
          'Email',
          'Employee ID',
          'Course Title',
          'Status',
          'Progress (%)',
          'Assessment Passed',
          'Best Score (%)',
          'Due Date',
          'Mandatory',
        ],
        ...db.enrollments.map((e) => {
          const u = db.users.find((user) => user.id === e.userId);
          const c = db.courses.find((course) => course.id === e.courseId);
          return [
            u?.fullName || e.userId,
            u?.email || '',
            u?.employeeId || '',
            c?.title || e.courseId,
            e.status,
            String(e.progressPercent),
            e.assessmentPassed ? 'Yes' : 'No',
            e.bestScore !== undefined ? String(e.bestScore) : 'N/A',
            e.dueDate || 'Optional',
            e.isMandatory ? 'Mandatory' : 'Optional',
          ];
        }),
      ];
    }

    if (mode === 'create_new') {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `${sheetTitle} (${new Date().toISOString().slice(0, 10)})`,
          },
          sheets: [
            {
              properties: {
                title: 'Training_Report',
              },
            },
          ],
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            error:
              errData?.error?.message ||
              `Failed to create Google Sheet (HTTP ${createRes.status}).`,
          },
          { status: createRes.status }
        );
      }

      const created = await createRes.json();
      const newId = created.spreadsheetId;
      const firstTab =
        created.sheets?.[0]?.properties?.title || 'Training_Report';

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
          newId
        )}/values/${encodeURIComponent(`${firstTab}!A1`)}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: rows,
          }),
        }
      );

      db.platformSettings.lastExportedSheetUrl = created.spreadsheetUrl;
      appendAuditLog(
        db,
        currentUser,
        'GOOGLE_SHEETS_EXPORT',
        'spreadsheet',
        newId,
        `Exported ${rows.length - 1} records (${reportType}) to new Google Sheet "${created.properties?.title}".`
      );
      writeDatabase(db);

      return NextResponse.json({
        spreadsheetId: newId,
        spreadsheetUrl: created.spreadsheetUrl,
        rowsWritten: rows.length,
        title: created.properties?.title,
      });
    }

    // Update existing spreadsheet after discovering first tab
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId is required when updating an existing sheet.' },
        { status: 400 }
      );
    }

    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`,
      {
        headers: { Authorization: authHeader },
      }
    );
    if (!metaRes.ok) {
      const errData = await metaRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errData?.error?.message ||
            'Unable to inspect target Google Sheet.',
        },
        { status: metaRes.status }
      );
    }
    const meta = await metaRes.json();
    const targetTab =
      body.sheetName || meta.sheets?.[0]?.properties?.title || 'Sheet1';

    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/${encodeURIComponent(`${targetTab}!A1`)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows,
        }),
      }
    );

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errData?.error?.message ||
            'Failed to write values to Google Sheet.',
        },
        { status: updateRes.status }
      );
    }

    db.platformSettings.lastExportedSheetUrl = meta.spreadsheetUrl;
    appendAuditLog(
      db,
      currentUser,
      'GOOGLE_SHEETS_SYNC',
      'spreadsheet',
      spreadsheetId,
      `Synced ${rows.length - 1} training records to Google Sheet tab "${targetTab}".`
    );
    writeDatabase(db);

    return NextResponse.json({
      spreadsheetId,
      spreadsheetUrl: meta.spreadsheetUrl,
      rowsWritten: rows.length,
      title: meta.properties?.title,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Google Sheets sync failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
