"use client";

import { countByStatus } from "@/lib/funnel";
import type { Seminar } from "@/lib/types";

const ITEMS: { key: keyof ReturnType<typeof countByStatus>; label: string; dot: string }[] = [
  { key: "total", label: "Total sessions", dot: "bg-slate-400 dark:bg-zinc-500" },
  { key: "done", label: "Done", dot: "bg-green-500" },
  { key: "finalised", label: "Finalised", dot: "bg-blue-500" },
  { key: "postponed", label: "Postponed", dot: "bg-orange-500" },
  { key: "nextMonth", label: "Next Month", dot: "bg-purple-500" },
];

export default function QuickStats({ seminars }: { seminars: Seminar[] }) {
  if (seminars.length === 0) return null;

  const counts = countByStatus(seminars);

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.dot}`} />
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-zinc-50 sm:text-2xl">
                {counts[item.key]}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
