"use client";

import { useState } from "react";
import { format } from "date-fns";
import { categorizeSeminar, formatStat, sumCallingField, sumField } from "@/lib/funnel";
import type { Seminar } from "@/lib/types";

type CardKey = "done" | "finalised" | "notConfirmed" | "postponed";

type CardConfig = {
  key: CardKey;
  title: string;
  subtitle: string;
  studentsLabel: string;
  dotClass: string;
  pillClass: string;
  ring: string; // tailwind border color
  muted?: boolean;
};

const CARDS: CardConfig[] = [
  {
    key: "done",
    title: "Sessions Done",
    subtitle: "Seminars that have taken place",
    studentsLabel: "Students addressed",
    dotClass: "bg-green-500",
    pillClass: "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    ring: "border-green-100 dark:border-green-900/50",
  },
  {
    key: "finalised",
    title: "In Pipeline (Finalised)",
    subtitle: "Date confirmed, yet to happen",
    studentsLabel: "To be addressed",
    dotClass: "bg-blue-500",
    pillClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    ring: "border-blue-100 dark:border-blue-900/50",
  },
  {
    key: "notConfirmed",
    title: "In Pipeline (Not Confirmed)",
    subtitle: "Date not confirmed yet",
    studentsLabel: "To be addressed",
    dotClass: "bg-amber-500",
    pillClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ring: "border-amber-100 dark:border-amber-900/50",
  },
];

const POSTPONED_CARD: CardConfig = {
  key: "postponed",
  title: "Postponed",
  subtitle: "Sessions on hold",
  studentsLabel: "To be addressed",
  dotClass: "bg-slate-400 dark:bg-zinc-500",
  pillClass: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  ring: "border-slate-200 dark:border-zinc-800",
  muted: true,
};

function dateLabel(seminar: Seminar): string {
  if (seminar.date) return format(seminar.date, "MMM d, yyyy");
  return seminar.dateRaw || seminar.statusRaw || "—";
}

/** Seminars with no usable date sort last; otherwise earliest first. */
function sortByDateAsc(seminars: Seminar[]): Seminar[] {
  return [...seminars].sort((a, b) => {
    if (a.date && b.date) return a.date.getTime() - b.date.getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

function QuickViewTable({ group, studentsLabel }: { group: Seminar[]; studentsLabel: string }) {
  const sorted = sortByDateAsc(group);
  return (
    <div className="mt-4 max-h-64 overflow-y-auto border-t border-slate-100 pt-3 dark:border-zinc-800">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-slate-400 dark:text-zinc-500">
            <th className="pb-1.5 font-medium">College</th>
            <th className="pb-1.5 font-medium">Date</th>
            <th className="pb-1.5 pl-2 text-right font-medium">{studentsLabel}</th>
            <th className="pb-1.5 pl-2 text-right font-medium">Prospects</th>
            <th className="pb-1.5 pl-2 text-right font-medium">Future Intake</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
          {sorted.map((seminar) => {
            const hasCallingData = seminar.callingMatchCount > 0;
            return (
              <tr key={seminar.id}>
                <td className="max-w-[8rem] truncate py-1.5 pr-2 font-medium text-slate-700 dark:text-zinc-200">
                  {seminar.collegeName}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-2 text-slate-500 dark:text-zinc-400">
                  {dateLabel(seminar)}
                </td>
                <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                  {seminar.noOfStudents || "—"}
                </td>
                <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                  {hasCallingData ? seminar.callingProspects : "—"}
                </td>
                <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                  {hasCallingData ? seminar.callingFutureIntake : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SummaryDashboard({ seminars }: { seminars: Seminar[] }) {
  const [expanded, setExpanded] = useState<Set<CardKey>>(new Set());

  const buckets: Record<CardKey, Seminar[]> = {
    done: [],
    finalised: [],
    notConfirmed: [],
    postponed: [],
  };

  for (const seminar of seminars) {
    const bucket = categorizeSeminar(seminar);
    if (bucket) buckets[bucket].push(seminar);
  }

  const toggle = (key: CardKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const postponed = buckets.postponed;
  const postponedStudents = sumField(postponed, (s) => s.noOfStudents);
  const postponedProspects = sumCallingField(postponed, (s) => s.callingProspects);
  const postponedFutureIntake = sumCallingField(postponed, (s) => s.callingFutureIntake);
  const postponedOpen = expanded.has("postponed");

  return (
    <div className="mb-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CARDS.map((card) => {
          const group = buckets[card.key];
          const students = sumField(group, (s) => s.noOfStudents);
          const prospects = sumCallingField(group, (s) => s.callingProspects);
          const futureIntake = sumCallingField(group, (s) => s.callingFutureIntake);
          const isOpen = expanded.has(card.key);

          return (
            <div
              key={card.key}
              className={`rounded-2xl border ${card.ring} bg-white p-4 shadow-sm sm:p-5 dark:bg-zinc-900`}
            >
              <button
                type="button"
                onClick={() => toggle(card.key)}
                disabled={group.length === 0}
                className="w-full text-left disabled:cursor-default"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${card.dotClass}`} />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
                      {card.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${card.pillClass}`}>
                      {group.length} {group.length === 1 ? "session" : "sessions"}
                    </span>
                    {group.length > 0 && (
                      <span
                        className={`text-slate-400 dark:text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        ▾
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-4 text-xs text-slate-400 dark:text-zinc-500">{card.subtitle}</p>

                <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
                      {formatStat(students)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{card.studentsLabel}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
                      {formatStat(prospects)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Prospects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
                      {formatStat(futureIntake)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Future Intake</p>
                  </div>
                </div>
              </button>

              {isOpen && group.length > 0 && (
                <QuickViewTable group={group} studentsLabel={card.studentsLabel} />
              )}
            </div>
          );
        })}
      </div>

      {postponed.length > 0 && (
        <div
          className={`mt-3 rounded-xl border ${POSTPONED_CARD.ring} bg-slate-50 px-4 py-2.5 dark:bg-zinc-900`}
        >
          <button
            type="button"
            onClick={() => toggle("postponed")}
            className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-left text-xs text-slate-500 dark:text-zinc-400"
          >
            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-500" />
              Postponed
            </span>
            <span>
              {postponed.length} {postponed.length === 1 ? "session" : "sessions"}
            </span>
            <span>{formatStat(postponedStudents)} to be addressed</span>
            <span>{formatStat(postponedProspects)} prospects</span>
            <span>{formatStat(postponedFutureIntake)} future intake</span>
            <span
              className={`ml-auto text-slate-400 dark:text-zinc-500 transition-transform ${postponedOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {postponedOpen && (
            <QuickViewTable group={postponed} studentsLabel={POSTPONED_CARD.studentsLabel} />
          )}
        </div>
      )}
    </div>
  );
}
