'use client';

import React, { useState } from 'react';
import { PublicShell } from '@/components/public-shell';
import { BRAND } from '@/lib/brand';
import { CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSent(true);
  };

  return (
    <PublicShell>
      <div className="bg-[#0B1F3A] text-white py-12 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Contact Learning & Development Support
          </h1>
          <p className="text-sm text-slate-300">
            Reach the {BRAND.name} administrative team ({BRAND.supportEmail}) for
            account provisioning requests or compliance inquiries.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-12">
        {sent ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Inquiry Logged with L&D Support</span>
            </div>
            <p>
              Thank you, {name}. Your message has been routed to{' '}
              <span className="font-mono">{BRAND.supportEmail}</span>.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-white border border-slate-200 rounded-xl space-y-4"
          >
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-semibold text-[#111827] mb-1"
              >
                Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-semibold text-[#111827] mb-1"
              >
                Corporate Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="contact-msg"
                className="block text-xs font-semibold text-[#111827] mb-1"
              >
                Support Request / Provisioning Details
              </label>
              <textarea
                id="contact-msg"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700"
            >
              Submit Inquiry
            </button>
          </form>
        )}
      </div>
    </PublicShell>
  );
}
