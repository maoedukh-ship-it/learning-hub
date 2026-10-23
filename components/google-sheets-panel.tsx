'use client';

import React, { useState } from 'react';
import { useHub } from './hub-context';
import { FileSpreadsheet, ExternalLink, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export function GoogleSheetsPanel() {
  const {
    googleEmail,
    googleToken,
    connectGoogleSheets,
    disconnectGoogleSheets,
    platformSettings,
    refreshHub,
  } = useHub();

  const [spreadsheetInput, setSpreadsheetInput] = useState('');
  const [sheetData, setSheetData] = useState<{
    title: string;
    spreadsheetUrl?: string;
    sheetTabs: string[];
    activeTab: string;
    values: string[][];
  } | null>(null);

  const [reportType, setReportType] = useState<'completions' | 'tna_gaps'>('completions');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Mandatory confirmation dialog state before mutating/writing to Google Sheets
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    mode: 'create_new' | 'update_existing';
    description: string;
  } | null>(null);

  const extractSpreadsheetId = (raw: string): string => {
    const trimmed = raw.trim();
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : trimmed;
  };

  const handleReadSpreadsheet = async (overrideTab?: string) => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!googleToken) {
      setErrorMessage('Please sign in with Google first to read or sync Google Sheets.');
      return;
    }

    const id = extractSpreadsheetId(spreadsheetInput);
    if (!id) {
      setErrorMessage('Please enter a valid Google Spreadsheet ID or URL.');
      return;
    }

    setBusy(true);
    try {
      const url = new URL('/api/sheets', window.location.origin);
      url.searchParams.set('spreadsheetId', id);
      if (overrideTab) {
        url.searchParams.set('sheetName', overrideTab);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to read Google Sheet.');
      } else {
        setSheetData(data);
        setStatusMessage(`Loaded "${data.title}" (Tab: ${data.activeTab})`);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Network error reading Google Sheet.'
      );
    } finally {
      setBusy(false);
    }
  };

  const executeConfirmedExport = async () => {
    if (!pendingConfirmAction || !googleToken) return;
    const mode = pendingConfirmAction.mode;
    setPendingConfirmAction(null);
    setErrorMessage(null);
    setStatusMessage(null);
    setBusy(true);

    try {
      const id = extractSpreadsheetId(spreadsheetInput);
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          spreadsheetId: mode === 'update_existing' ? id : undefined,
          sheetName: sheetData?.activeTab,
          reportType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to export report to Google Sheets.');
      } else {
        setStatusMessage(
          `Successfully wrote ${data.rowsWritten} rows to Google Sheet "${data.title}".`
        );
        if (data.spreadsheetId) {
          setSpreadsheetInput(data.spreadsheetId);
        }
        await refreshHub();
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error syncing with Google Sheets.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#16A34A]" />
            <h2 className="text-base font-bold text-[#111827]">
              Google Sheets Live Reporting & Roster Integration
            </h2>
          </div>
          <p className="text-xs text-[#6B7280]">
            Connect your Google Workspace account to inspect training spreadsheets or export live
            Course Completion and TNA Competency Gap reports directly to Google Sheets.
          </p>
        </div>

        {/* Official Sign in with Google button per workspace-integration skill */}
        <div className="shrink-0">
          {!googleToken ? (
            <button
              type="button"
              onClick={async () => {
                setErrorMessage(null);
                const res = await connectGoogleSheets();
                if (!res.ok && res.error) {
                  setErrorMessage(res.error);
                }
              }}
              className="gsi-material-button inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-[#111827] hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-4 h-4 block"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#16A34A] font-medium">
                Connected: {googleEmail}
              </span>
              <button
                type="button"
                onClick={() => disconnectGoogleSheets()}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banners */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
          {platformSettings.lastExportedSheetUrl && (
            <a
              href={platformSettings.lastExportedSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
            >
              Open in Google Sheets <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Mandatory User Confirmation Dialog before mutating/creating Google Sheets */}
      {pendingConfirmAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheets-confirm-title"
          className="p-5 bg-[#F3F4F6] border border-slate-300 rounded-xl space-y-3"
        >
          <h3 id="sheets-confirm-title" className="text-sm font-bold text-[#111827]">
            Confirm Google Sheets Data Write
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {pendingConfirmAction.description}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={executeConfirmedExport}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm & Write to Google Sheets
            </button>
            <button
              type="button"
              onClick={() => setPendingConfirmAction(null)}
              className="px-4 py-2 text-xs font-medium text-[#111827] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export / Sync Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#111827]">
            1. Export Learning Hub Report to New Google Sheet
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-[#6B7280]" htmlFor="report-type-select">
              Report Dataset:
            </label>
            <select
              id="report-type-select"
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value as 'completions' | 'tna_gaps')
              }
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-[#111827]"
            >
              <option value="completions">
                Course Enrollments, Completion & Compliance Status
              </option>
              <option value="tna_gaps">
                Corporate TNA & Employee Competency Gaps
              </option>
            </select>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (!googleToken) {
                  setErrorMessage(
                    'Please click "Sign in with Google" first to authorize Google Sheets export.'
                  );
                  return;
                }
                setPendingConfirmAction({
                  mode: 'create_new',
                  description: `Are you sure you want to create a new Google Spreadsheet in your Google Drive and populate it with Learning Hub's ${
                    reportType === 'tna_gaps'
                      ? 'TNA Competency Gap records'
                      : 'Course Completion & Compliance records'
                  }?`,
                });
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              Export to New Google Sheet
            </button>
          </div>
        </div>

        {/* Inspect / Sync Existing Spreadsheet */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#111827]">
            2. Inspect or Update an Existing Google Spreadsheet
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              aria-label="Google Spreadsheet ID or URL"
              placeholder="Paste Google Spreadsheet URL or ID..."
              value={spreadsheetInput}
              onChange={(e) => setSpreadsheetInput(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-[#111827]"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => handleReadSpreadsheet()}
              className="px-3.5 py-2 text-xs font-semibold text-[#111827] bg-[#F3F4F6] border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Read Sheet Tabs
            </button>
            {spreadsheetInput.trim() && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!googleToken) {
                    setErrorMessage('Please sign in with Google first.');
                    return;
                  }
                  setPendingConfirmAction({
                    mode: 'update_existing',
                    description: `Are you sure you want to overwrite cells in spreadsheet "${extractSpreadsheetId(
                      spreadsheetInput
                    )}" (Tab: ${
                      sheetData?.activeTab || 'first discovered tab'
                    }) with the latest Learning Hub report?`,
                  });
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Sync Report to Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sheet Preview Table if loaded */}
      {sheetData && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-[#111827]">
              Spreadsheet: {sheetData.title} · Discovered Tabs:{' '}
              {sheetData.sheetTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleReadSpreadsheet(tab)}
                  className={`ml-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                    sheetData.activeTab === tab
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-[#F3F4F6] text-[#111827] hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <tbody>
                {sheetData.values.slice(0, 10).map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={
                      rIdx === 0
                        ? 'bg-[#F3F4F6] font-semibold text-[#111827] border-b border-slate-200'
                        : 'border-b border-slate-100 text-[#6B7280]'
                    }
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 font-mono">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
