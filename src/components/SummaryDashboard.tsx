"use client";

import { categorizeSeminar, sumField } from "@/lib/funnel";
import type { Seminar } from "@/lib/types";

type CardConfig = {
  key: "done" | "finalised" | "notConfirmed";
  title: string;
  subtitle: string;
  accent: string; // tailwind classes for the icon dot + count pill
  ring: string; // tailwind border color
};

const CARDS: CardConfig[] = [
  {
    key: "done",
    title: "Sessions Done",
    subtitle: "Seminars that have taken place",
    accent: "bg-green-500 text-green-700 bg-green-50",
    ring: "border-green-100",
  },
  {
    key: "finalised",
    title: "In Pipeline (Finalised)",
    subtitle: "Date confirmed, yet to happen",
    accent: "bg-blue-500 text-blue-700 bg-blue-50",
    ring: "border-blue-100",
  },
  {
    key: "notConfirmed",
    title: "In Pipeline (Not Confirmed)",
    subtitle: "Date not confirmed yet",
    accent: "bg-amber-500 text-amber-700 bg-amber-50",
    ring: "border-amber-100",
  },
];

function formatStat(stat: { total: number; hasData: boolean }): string {
  return stat.hasData ? stat.total.toLocaleString() : "—";
}

export default function SummaryDashboard({ seminars }: { seminars: Seminar[] }) {
  const buckets: Record<string, Seminar[]> = {
    done: [],
    finalised: [],
    notConfirmed: [],
    postponed: [],
  };

  for (const seminar of seminars) {
    const bucket = categorizeSeminar(seminar);
    if (bucket) buckets[bucket].push(seminar);
  }

  const postponed = buckets.postponed;
  const postponedStudents = sumField(postponed, (s) => s.noOfStudents);
  const postponedProspects = sumField(postponed, (s) => s.prospects);

  return (
    <div className="mb-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CARDS.map((card) => {
          const group = buckets[card.key];
          const students = sumField(group, (s) => s.noOfStudents);
          const prospects = sumField(group, (s) => s.prospects);
          const [dotClass, textClass, pillBgClass] = card.accent.split(" ");

          return (
            <div
              key={card.key}
              className={`rounded-2xl border ${card.ring} bg-white p-4 shadow-sm sm:p-5`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                  <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${pillBgClass} ${textClass}`}
                >
                  {group.length} {group.length === 1 ? "session" : "sessions"}
                </span>
              </div>
              <p className="mb-4 text-xs text-slate-400">{card.subtitle}</p>

              <div className="flex items-end gap-6">
                <div>
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {formatStat(students)}
                  </p>
                  <p className="text-xs text-slate-500">Students addressed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {formatStat(prospects)}
                  </p>
                  <p className="text-xs text-slate-500">Prospects</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {postponed.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Postponed</span>
          <span>
            {postponed.length} {postponed.length === 1 ? "session" : "sessions"}
          </span>
          <span>{formatStat(postponedStudents)} students addressed</span>
          <span>{formatStat(postponedProspects)} prospects</span>
        </div>
      )}
    </div>
  );
}
