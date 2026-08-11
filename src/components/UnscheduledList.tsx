"use client";

import { colorForStream } from "@/lib/colors";
import type { Seminar } from "@/lib/types";

export default function UnscheduledList({ seminars }: { seminars: Seminar[] }) {
  if (seminars.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-zinc-50">
        Not yet on the calendar
      </h3>
      <p className="mb-3 text-xs text-slate-500 dark:text-zinc-400">
        These seminars don&apos;t currently have a specific date, so they
        can&apos;t be placed on a day.
      </p>
      <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
        {seminars.map((seminar) => {
          const streamLabel = seminar.streams.length > 0 ? seminar.streams.join(", ") : "Unspecified";
          const color = colorForStream(seminar.streams[0] ?? "Unspecified");
          return (
            <li key={seminar.id} className="flex items-center gap-3 py-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: color.dot }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-100">
                  {seminar.collegeName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                  {streamLabel} · {seminar.statusRaw || seminar.dateRaw || "no date given"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
