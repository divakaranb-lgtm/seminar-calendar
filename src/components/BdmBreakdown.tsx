"use client";

import { formatStat, sumCallingField, sumField } from "@/lib/funnel";
import type { Seminar } from "@/lib/types";

export default function BdmBreakdown({ seminars }: { seminars: Seminar[] }) {
  if (seminars.length === 0) return null;

  const groups = new Map<string, Seminar[]>();
  for (const seminar of seminars) {
    const bdm = seminar.bdm.trim() || "Unassigned";
    const list = groups.get(bdm) ?? [];
    list.push(seminar);
    groups.set(bdm, list);
  }

  const rows = Array.from(groups.entries())
    .map(([bdm, group]) => ({
      bdm,
      sessions: group.length,
      students: sumField(group, (s) => s.noOfStudents),
      prospects: sumCallingField(group, (s) => s.callingProspects),
      futureIntake: sumCallingField(group, (s) => s.callingFutureIntake),
    }))
    .sort((a, b) => b.sessions - a.sessions || a.bdm.localeCompare(b.bdm));

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-zinc-50">
        BDM Breakdown
      </h3>
      <p className="mb-3 text-xs text-slate-500 dark:text-zinc-400">
        Sessions and students by BDM, across every status.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
              <th className="py-2 font-medium">BDM</th>
              <th className="py-2 text-right font-medium">Sessions</th>
              <th className="py-2 text-right font-medium">Total students</th>
              <th className="py-2 text-right font-medium">Prospects</th>
              <th className="py-2 text-right font-medium">Future Intake</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.bdm}>
                <td className="py-2 font-medium text-slate-800 dark:text-zinc-100">{row.bdm}</td>
                <td className="py-2 text-right text-slate-700 dark:text-zinc-300">{row.sessions}</td>
                <td className="py-2 text-right text-slate-700 dark:text-zinc-300">
                  {formatStat(row.students)}
                </td>
                <td className="py-2 text-right text-slate-700 dark:text-zinc-300">
                  {formatStat(row.prospects)}
                </td>
                <td className="py-2 text-right text-slate-700 dark:text-zinc-300">
                  {formatStat(row.futureIntake)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
