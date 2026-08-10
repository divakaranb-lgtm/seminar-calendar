"use client";

import { useState } from "react";
import { format } from "date-fns";
import { categorizeSeminar, sumField } from "@/lib/funnel";
import type { Seminar } from "@/lib/types";

type CardKey = "done" | "finalised" | "notConfirmed";

type CardConfig = {
  key: CardKey;
  title: string;
  subtitle: string;
  studentsLabel: string;
  accent: string; // tailwind classes for the icon dot + count pill
  ring: string; // tailwind border color
};

const CARDS: CardConfig[] = [
  {
    key: "done",
    title: "Sessions Done",
    subtitle: "Seminars that have taken place",
    studentsLabel: "Students addressed",
    accent: "bg-green-500 text-green-700 bg-green-50",
    ring: "border-green-100",
  },
  {
    key: "finalised",
    title: "In Pipeline (Finalised)",
    subtitle: "Date confirmed, yet to happen",
    studentsLabel: "To be addressed",
    accent: "bg-blue-500 text-blue-700 bg-blue-50",
    ring: "border-blue-100",
  },
  {
    key: "notConfirmed",
    title: "In Pipeline (Not Confirmed)",
    subtitle: "Date not confirmed yet",
    studentsLabel: "To be addressed",
    accent: "bg-amber-500 text-amber-700 bg-amber-50",
    ring: "border-amber-100",
  },
];

function formatStat(stat: { total: number; hasData: boolean }): string {
  return stat.hasData ? stat.total.toLocaleString() : "—";
}

function dateLabel(seminar: Seminar): string {
  if (seminar.date) return format(seminar.date, "MMM d, yyyy");
  return seminar.dateRaw || seminar.statusRaw || "—";
}

export default function SummaryDashboard({ seminars }: { seminars: Seminar[] }) {
  const [expanded, setExpanded] = useState<Set<CardKey>>(new Set());

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

  const toggle = (key: CardKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="mb-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CARDS.map((card) => {
          const group = buckets[card.key];
          const students = sumField(group, (s) => s.noOfStudents);
          const prospects = sumField(group, (s) => s.prospects);
          const [dotClass, textClass, pillBgClass] = card.accent.split(" ");
          const isOpen = expanded.has(card.key);

          return (
            <div
              key={card.key}
              className={`rounded-2xl border ${card.ring} bg-white p-4 shadow-sm sm:p-5`}
            >
              <button
                type="button"
                onClick={() => toggle(card.key)}
                disabled={group.length === 0}
                className="w-full text-left disabled:cursor-default"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                    <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${pillBgClass} ${textClass}`}
                    >
                      {group.length} {group.length === 1 ? "session" : "sessions"}
                    </span>
                    {group.length > 0 && (
                      <span
                        className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        ▾
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-4 text-xs text-slate-400">{card.subtitle}</p>

                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                      {formatStat(students)}
                    </p>
                    <p className="text-xs text-slate-500">{card.studentsLabel}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                      {formatStat(prospects)}
                    </p>
                    <p className="text-xs text-slate-500">Prospects</p>
                  </div>
                </div>
              </button>

              {isOpen && group.length > 0 && (
                <div className="mt-4 max-h-64 overflow-y-auto border-t border-slate-100 pt-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="pb-1.5 font-medium">College</th>
                        <th className="pb-1.5 font-medium">Date</th>
                        <th className="pb-1.5 pl-2 text-right font-medium">
                          {card.studentsLabel}
                        </th>
                        <th className="pb-1.5 pl-2 text-right font-medium">Prospects</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {group.map((seminar) => (
                        <tr key={seminar.id}>
                          <td className="max-w-[9rem] truncate py-1.5 pr-2 font-medium text-slate-700">
                            {seminar.collegeName}
                          </td>
                          <td className="whitespace-nowrap py-1.5 pr-2 text-slate-500">
                            {dateLabel(seminar)}
                          </td>
                          <td className="py-1.5 pl-2 text-right text-slate-700">
                            {seminar.noOfStudents || "—"}
                          </td>
                          <td className="py-1.5 pl-2 text-right text-slate-700">
                            {seminar.prospects || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
