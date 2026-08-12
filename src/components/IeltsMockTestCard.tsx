"use client";

import { useState } from "react";
import { IELTS_BRANCHES } from "@/lib/fetchIeltsSheet";
import { computeOverallStat, type IeltsBranchStat } from "@/lib/ieltsStats";

type Props = {
  /** null = still loading or failed to fetch; shows "—" placeholders. */
  branchStats: IeltsBranchStat[] | null;
};

function fmtNum(n: number | null): string {
  return n === null ? "—" : n.toLocaleString();
}

function fmtPct(n: number | null): string {
  return n === null ? "—" : `${n}%`;
}

function fmtCountAndPct(count: number | null, pct: number | null): string {
  if (count === null) return "—";
  return pct === null ? count.toLocaleString() : `${count.toLocaleString()} (${pct}%)`;
}

type Row = {
  branch: string;
  totalRegistrations: number | null;
  ca: number | null;
  totalTestTaken: number | null;
  onlinePct: number | null;
  inBranchPct: number | null;
};

export default function IeltsMockTestCard({ branchStats }: Props) {
  const [open, setOpen] = useState(false);

  const rows: Row[] =
    branchStats ??
    IELTS_BRANCHES.map((branch) => ({
      branch,
      totalRegistrations: null,
      ca: null,
      totalTestTaken: null,
      onlinePct: null,
      inBranchPct: null,
    }));

  const overall = branchStats ? computeOverallStat(branchStats) : null;

  return (
    <div className="mt-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm dark:border-teal-900/50 dark:bg-zinc-900 sm:p-5">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full text-left">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
              IELTS Mock Test
            </h3>
          </div>
          <span
            className={`text-slate-400 dark:text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </div>
        <p className="mb-4 text-xs text-slate-400 dark:text-zinc-500">
          Registrations and completion, by branch
        </p>

        <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
              {fmtNum(overall?.totalRegistrations ?? null)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Total Registrations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
              {fmtNum(overall?.ca ?? null)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">CA</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
              {fmtCountAndPct(overall?.totalTestTaken ?? null, overall?.testTakenPct ?? null)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Total Test Taken</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
              {fmtPct(overall?.onlinePct ?? null)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Online</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
              {fmtPct(overall?.inBranchPct ?? null)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">In Branch</p>
          </div>
        </div>
      </button>

      {open && (
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 dark:text-zinc-500">
                <th className="pb-1.5 font-medium">Branch</th>
                <th className="pb-1.5 pl-2 text-right font-medium">Total Regs</th>
                <th className="pb-1.5 pl-2 text-right font-medium">CA</th>
                <th className="pb-1.5 pl-2 text-right font-medium">Total Test Taken</th>
                <th className="pb-1.5 pl-2 text-right font-medium">Online %</th>
                <th className="pb-1.5 pl-2 text-right font-medium">In Branch %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
              {rows.map((b) => (
                <tr key={b.branch}>
                  <td className="py-1.5 pr-2 font-medium text-slate-700 dark:text-zinc-200">
                    {b.branch}
                  </td>
                  <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                    {fmtNum(b.totalRegistrations)}
                  </td>
                  <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                    {fmtNum(b.ca)}
                  </td>
                  <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                    {fmtNum(b.totalTestTaken)}
                  </td>
                  <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                    {fmtPct(b.onlinePct)}
                  </td>
                  <td className="py-1.5 pl-2 text-right text-slate-700 dark:text-zinc-200">
                    {fmtPct(b.inBranchPct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!branchStats && (
            <p className="mt-3 text-xs text-slate-400 dark:text-zinc-500">
              Loading data sheet…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
