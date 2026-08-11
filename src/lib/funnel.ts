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

/**
 * Ordering used within a calendar day cell and its day-panel list: done
 * sessions first, then finalised, then everything still uncertain
 * (tentative, not confirmed, next month, ...), with postponed/cancelled
 * last since they're paused rather than actively happening.
 */
function statusPriority(seminar: Seminar): number {
  const status = seminar.statusRaw.trim().toLowerCase();
  if (status.includes("postpon") || status.includes("cancel")) return 3;
  if (status === "done") return 0;
  if (FINALISED_WORDS.has(status)) return 1;
  return 2;
}

export function sortByStatusPriority(seminars: Seminar[]): Seminar[] {
  return [...seminars].sort((a, b) => statusPriority(a) - statusPriority(b));
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

export type StatusCounts = {
  total: number;
  done: number;
  finalised: number;
  postponed: number;
  nextMonth: number;
};

/**
 * Every-record status tally for the top-of-page quick summary. `total`
 * always equals the sheet's row count (every seminar, regardless of
 * status); the 4 named counts are a subset shown for a quick glance and
 * won't necessarily sum to `total` (e.g. "yet to confirm" rows aren't
 * broken out here - they're covered by the pipeline card below instead).
 */
export function countByStatus(seminars: Seminar[]): StatusCounts {
  const counts: StatusCounts = { total: seminars.length, done: 0, finalised: 0, postponed: 0, nextMonth: 0 };

  for (const seminar of seminars) {
    const status = seminar.statusRaw.trim().toLowerCase();
    if (status.includes("postpon")) counts.postponed++;
    else if (status === "done") counts.done++;
    else if (FINALISED_WORDS.has(status)) counts.finalised++;
    else if (status === "next month") counts.nextMonth++;
  }

  return counts;
}
