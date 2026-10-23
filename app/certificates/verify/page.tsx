'use client';

import React, { useState } from 'react';
import { PublicShell } from '@/components/public-shell';
import { useHub } from '@/components/hub-context';
import { verifyCertificateRecord } from '@/lib/lms-logic';
import { BRAND } from '@/lib/brand';
import { Award, CheckCircle2, XCircle, Search, ShieldCheck } from 'lucide-react';

export default function CertificateVerifyPage() {
  const { certificates } = useHub();
  const [code, setCode] = useState('LH-2026-0001');
  const [queriedCode, setQueriedCode] = useState('LH-2026-0001');

  const verification = verifyCertificateRecord(certificates, queriedCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQueriedCode(code);
  };

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="text-xs text-blue-300 font-medium">
            {BRAND.name} · Public Credential Registry
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Digital Certificate Verification
          </h1>
          <p className="text-sm text-slate-300">
            Verify the authenticity and active standing of any Learning Hub
            certificate using its unique certificate identifier.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-8">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#F3F4F6] border border-slate-200 rounded-xl space-y-4"
        >
          <label
            htmlFor="cert-code-input"
            className="block text-xs font-bold text-[#111827]"
          >
            Certificate Verification Identifier
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="cert-code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., LH-2026-0001"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-[#111827]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Verify Credential
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
            <span>Sample Issued Identifiers:</span>
            {certificates.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCode(c.certificateNumber);
                  setQueriedCode(c.certificateNumber);
                }}
                className="px-2.5 py-1 font-mono bg-white border border-slate-300 rounded text-[#111827] hover:bg-slate-50"
              >
                {c.certificateNumber} ({c.status})
              </button>
            ))}
          </div>
        </form>

        {/* Verification Result */}
        {verification.verified && verification.certificate ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
              <div>
                <div className="font-bold">Authentic & Active Credential</div>
                <div>{verification.message}</div>
              </div>
            </div>

            {/* Official Certificate Preview */}
            <div className="border-2 border-[#0B1F3A] rounded-xl p-8 lg:p-12 bg-white space-y-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  <div className="text-lg font-bold text-[#0B1F3A]">
                    {BRAND.name}
                  </div>
                  <div className="text-xs text-[#6B7280]">{BRAND.tagline}</div>
                </div>
                <div className="text-right font-mono text-xs text-[#111827]">
                  <div>Certificate No: {verification.certificate.certificateNumber}</div>
                  <div className="text-[#6B7280]">
                    Issued: {verification.certificate.issuedAt}
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4 py-4">
                <div className="text-xs font-semibold text-[#2563EB]">
                  Official Certificate of Achievement
                </div>
                <div className="text-xs text-[#6B7280]">
                  This certifies that
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                  {verification.certificate.learnerName}
                </div>
                <div className="text-xs text-[#6B7280] max-w-md mx-auto">
                  has satisfactorily completed all required modules and passed the
                  server-validated examination for
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#111827] max-w-2xl mx-auto">
                  {verification.certificate.courseTitle}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#6B7280]">
                <div>
                  <div className="font-semibold text-[#111827]">
                    {verification.certificate.issuingAuthority}
                  </div>
                  <div>Issuing Authority</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Active</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Print / Save PDF
                  </button>
                </div>
                <div className="sm:text-right">
                  <div className="font-semibold text-[#111827]">
                    {verification.certificate.signatory}
                  </div>
                  <div>Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-900">
            <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">
                {verification.status === 'revoked'
                  ? 'Certificate Revoked / Invalidated'
                  : 'Certificate Not Found'}
              </div>
              <div>{verification.message}</div>
              {verification.certificate?.revokedReason && (
                <div>
                  <strong>Revocation Reason:</strong>{' '}
                  {verification.certificate.revokedReason}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
