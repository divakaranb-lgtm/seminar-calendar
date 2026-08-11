import type { Seminar } from "./types";

export type FunnelBucket = "done" | "finalised" | "notConfirmed" | "postponed";

const FINALISED_WORDS = new Set(["finalised", "finalized", "confirmed", "final"]);

/**
 * Buckets a seminar for the dashboard summary. Priority matters: a
 * postponed seminar keeps its original date (dateSource can still be
 * "explicit"), so it must be checked before the finalised/done checks or
 * it would double count there. "Not Confirmed" is deliberately narrow -
 * only the literal "yet to confirm" status, not "Next Month" or any other
 * status that merely resolves to an estimated date.
 */
export function categorizeSeminar(seminar: Seminar): FunnelBucket | null {
  const status = seminar.statusRaw.trim().toLowerCase();

  if (status.includes("postpon")) return "postponed";
  if (status === "done") return "done";
  if (FINALISED_WORDS.has(status)) return "finalised";
  if (status === "yet to confirm") return "notConfirmed";

  return null;
}

/** Extracts the leading number from a cell like "200+" or "1,250". */
export function parseNumericValue(raw: string): number {
  if (!raw) return 0;
  const match = raw.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

export function sumField(seminars: Seminar[], getValue: (s: Seminar) => string) {
  let total = 0;
  let hasData = false;
  for (const seminar of seminars) {
    const raw = getValue(seminar);
    if (raw.trim()) {
      hasData = true;
      total += parseNumericValue(raw);
    }
  }
  return { total, hasData };
}

/** Sums a seminar's calling-sheet stat, only counting seminars that actually have calling data. */
export function sumCallingField(seminars: Seminar[], getValue: (s: Seminar) => number) {
  return sumField(seminars, (s) => (s.callingMatchCount > 0 ? String(getValue(s)) : ""));
}

export function formatStat(stat: { total: number; hasData: boolean }): string {
  return stat.hasData ? stat.total.toLocaleString() : "—";
}
