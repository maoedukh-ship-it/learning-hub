import React from 'react';
import { Shield, Database, Scale, Users, Terminal } from 'lucide-react';

export function CourseVisual({
  theme = 'navy',
  categoryName,
  className = 'h-44',
}: {
  theme?: 'navy' | 'cobalt' | 'emerald' | 'slate' | 'amber' | 'indigo';
  categoryName?: string;
  className?: string;
}) {
  const bgMap: Record<string, string> = {
    navy: 'bg-[#0B1F3A]',
    cobalt: 'bg-[#1E3A8A]',
    emerald: 'bg-[#0F292A]',
    slate: 'bg-[#1E293B]',
    amber: 'bg-[#271F16]',
    indigo: 'bg-[#172554]',
  };

  const Icon =
    theme === 'cobalt'
      ? Scale
      : theme === 'emerald'
      ? Database
      : theme === 'slate'
      ? Users
      : theme === 'amber'
      ? Terminal
      : Shield;

  return (
    <div
      className={`relative overflow-hidden ${
        bgMap[theme] || bgMap.navy
      } ${className} flex flex-col justify-between p-5 text-white select-none`}
    >
      {/* Subtle architectural blueprint lines */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        viewBox="0 0 400 200"
        fill="none"
      >
        <path
          d="M0 40H400M0 80H400M0 120H400M0 160H400M80 0V200M160 0V200M240 0V200M320 0V200"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <circle cx="320" cy="60" r="48" stroke="#60A5FA" strokeWidth="1.5" />
        <circle cx="320" cy="60" r="24" stroke="#93C5FD" strokeWidth="1" />
      </svg>

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[11px] font-medium text-blue-200 tracking-wide">
          {categoryName || 'Enterprise Curriculum'}
        </span>
        <Icon className="w-5 h-5 text-blue-300" />
      </div>

      <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-300 font-mono">
        <span>Learning Hub Verified</span>
        <span aria-hidden="true">·</span>
        <span>ISO/L&D Standard</span>
      </div>
    </div>
  );
}
