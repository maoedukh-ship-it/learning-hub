'use client';

import React, { use, useState } from 'react';
import { PortalShell } from '@/components/portal-shell';
import { GoogleSheetsPanel } from '@/components/google-sheets-panel';
import { useHub } from '@/components/hub-context';
import { CheckCircle2, Building2, ShieldAlert } from 'lucide-react';

export default function OrganizationPortalCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = use(params);
  const section = slug?.[0] || 'dashboard';

  const {
    users,
    courses,
    departments,
    teams,
    enrollments,
    tnaRecords,
    adminAssignTraining,
    createTNARecord,
  } = useHub();

  const [assignUserId, setAssignUserId] = useState('user-learn-1');
  const [assignCourseId, setAssignCourseId] = useState('course-cyber-101');
  const [assignDueDate, setAssignDueDate] = useState('2026-11-30');
  const [feedback, setFeedback] = useState<string | null>(null);

  const [tnaEmpId, setTnaEmpId] = useState('user-learn-1');
  const [tnaCompName, setTnaCompName] = useState(
    'Distributed PostgreSQL Replication & Failover'
  );
  const [tnaExpected, setTnaExpected] = useState(5);
  const [tnaCurrent, setTnaCurrent] = useState(3);
  const [tnaCourseId, setTnaCourseId] = useState('course-data-301');

  const employees = users.filter((u) => u.role === 'learner');
  const overdueList = enrollments.filter(
    (e) => e.dueDate && e.status !== 'completed' && e.dueDate < '2026-10-22'
  );

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await adminAssignTraining({
      userId: assignUserId,
      courseId: assignCourseId,
      dueDate: assignDueDate,
      isMandatory: true,
    });
    if (res.ok) {
      setFeedback('Mandatory training assigned to team member.');
    }
  };

  const handleCreateTNA = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createTNARecord({
      employeeId: tnaEmpId,
      competencyName: tnaCompName,
      expectedLevel: tnaExpected,
      currentLevel: tnaCurrent,
      recommendedCourseId: tnaCourseId,
      reviewDate: '2026-12-01',
    });
    if (res.ok) {
      setFeedback('Department TNA competency evaluation saved.');
    }
  };

  return (
    <PortalShell
      portalTitle={`Organization & Training Manager Portal — ${section.toUpperCase()}`}
      requiredPortal="manager"
    >
      <div className="space-y-8">
        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Manager KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Scoped Employees</div>
            <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums mt-1">
              {employees.length}
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Departments & Teams</div>
            <div className="text-2xl font-bold text-[#2563EB] font-mono tabular-nums mt-1">
              {departments.length} / {teams.length}
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Overdue Assignments</div>
            <div className="text-2xl font-bold text-[#DC2626] font-mono tabular-nums mt-1">
              {overdueList.length}
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-[#6B7280]">Identified TNA Gaps</div>
            <div className="text-2xl font-bold text-[#D97706] font-mono tabular-nums mt-1">
              {tnaRecords.length}
            </div>
          </div>
        </div>

        {/* Departments & Teams Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#111827]">
              Departments & Compliance Completion Status
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-4 border border-slate-200 rounded-lg space-y-2 text-xs"
              >
                <div className="font-mono text-[#6B7280]">{d.code}</div>
                <div className="font-bold text-[#111827]">{d.name}</div>
                <div className="text-[#6B7280]">Manager: {d.managerName}</div>
                <div className="pt-1 flex items-center justify-between font-mono">
                  <span>Headcount: {d.headcount}</span>
                  <span className="font-bold text-[#16A34A]">
                    {d.completionRate}% Complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager Actions: Assign Mandatory Training + Evaluate TNA Competency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#111827]">
              Assign Mandatory Training to Team Member
            </h2>
            <form onSubmit={handleAssign} className="space-y-3 text-xs">
              <div>
                <label
                  htmlFor="org-assign-emp"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Employee
                </label>
                <select
                  id="org-assign-emp"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {employees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.jobTitle})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="org-assign-course"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Required Course
                </label>
                <select
                  id="org-assign-course"
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {courses
                    .filter((c) => c.status === 'published')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="org-assign-due"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Due Date
                </label>
                <input
                  id="org-assign-due"
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 font-semibold text-white bg-[#0B1F3A] rounded-lg"
              >
                Assign Training
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#111827]">
              Conduct Employee Competency & TNA Assessment
            </h2>
            <form onSubmit={handleCreateTNA} className="space-y-3 text-xs">
              <div>
                <label
                  htmlFor="org-tna-emp"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Employee
                </label>
                <select
                  id="org-tna-emp"
                  value={tnaEmpId}
                  onChange={(e) => setTnaEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {employees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} — {u.jobTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="org-tna-comp"
                  className="block font-semibold text-[#111827] mb-1"
                >
                  Competency / Skill
                </label>
                <input
                  id="org-tna-comp"
                  type="text"
                  required
                  value={tnaCompName}
                  onChange={(e) => setTnaCompName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="org-tna-exp"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Expected Level: {tnaExpected}
                  </label>
                  <input
                    id="org-tna-exp"
                    type="range"
                    min={1}
                    max={5}
                    value={tnaExpected}
                    onChange={(e) => setTnaExpected(Number(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="org-tna-cur"
                    className="block font-semibold text-[#111827] mb-1"
                  >
                    Current Level: {tnaCurrent}
                  </label>
                  <input
                    id="org-tna-cur"
                    type="range"
                    min={1}
                    max={5}
                    value={tnaCurrent}
                    onChange={(e) => setTnaCurrent(Number(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 font-semibold text-white bg-[#2563EB] rounded-lg"
              >
                Record Competency Gap
              </button>
            </form>
          </div>
        </div>

        {/* TNA Matrix Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
            <h2 className="text-base font-bold text-[#111827]">
              Department Training Needs Analysis (TNA) Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[#6B7280]">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Competency</th>
                  <th className="py-2 pr-3 text-right">Expected</th>
                  <th className="py-2 pr-3 text-right">Assessed</th>
                  <th className="py-2 pr-3 text-right">Gap</th>
                  <th className="py-2 pr-3">Priority</th>
                  <th className="py-2">Recommended Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tnaRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 font-semibold text-[#111827]">
                      {r.employeeName}
                    </td>
                    <td className="py-2.5 pr-3">{r.competencyName}</td>
                    <td className="py-2.5 pr-3 text-right font-mono">
                      L{r.expectedLevel}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono">
                      L{r.currentLevel}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono font-bold text-[#DC2626]">
                      -{r.gap}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold">{r.priority}</td>
                    <td className="py-2.5">{r.recommendedCourseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Google Sheets Sync for Organization Reports */}
        <GoogleSheetsPanel />
      </div>
    </PortalShell>
  );
}
