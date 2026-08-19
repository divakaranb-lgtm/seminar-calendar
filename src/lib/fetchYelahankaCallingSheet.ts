import Papa from "papaparse";
import { findKey } from "./csvUtils";
import type { CallingRecord } from "./fetchCallingSheet";

/**
 * A second BDM (Yelahanka branch) tracks her own calling data in a personal
 * sheet, one tab per college, rather than the shared calling sheet. Claret
 * and Sambhram IT are the two colleges from that sheet that match seminars
 * we track in the main sheet; her other tabs (mock test responses, other
 * colleges) don't correspond to a tracked seminar yet, so they're skipped.
 *
 * Each tab's rows don't carry a per-row date or an "Institute" column the
 * way the shared calling sheet does, so `institute` is fixed per tab here.
 * It's deliberately just "<College> Seminar" with no "_<stream>" suffix -
 * the per-lead "Department" values (BSC, BCA, CS, CSE, "BE AI and ML", ...)
 * are far more granular than the seminar's own tracked streams and don't
 * map onto them cleanly, so leaving the stream part out makes every lead
 * count toward the seminar regardless of department, rather than silently
 * dropping ones whose department doesn't happen to match a tracked stream.
 */
const SOURCES: { url: string; institute: string }[] = [
  {
    url: "https://docs.google.com/spreadsheets/d/1WTwI8iGBnt4GZbshKHKUzlnlIwW3d3qTTbPMBjhjHEQ/export?format=csv&gid=905122347",
    institute: "Claret Seminar",
  },
  {
    url: "https://docs.google.com/spreadsheets/d/1WTwI8iGBnt4GZbshKHKUzlnlIwW3d3qTTbPMBjhjHEQ/export?format=csv&gid=2084051234",
    institute: "Sambhram IT Seminar",
  },
];

async function fetchTab(url: string, institute: string): Promise<CallingRecord[]> {
  const res = await fetch(`${url}&_ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch Yelahanka calling tab (status ${res.status})`);
  }
  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const nameKey = findKey(parsed.data[0] ?? {}, ["name"]);
  const statusKey = findKey(parsed.data[0] ?? {}, ["status"]);

  return parsed.data
    .filter((row) => (row[nameKey] || "").trim())
    .map(
      (row): CallingRecord => ({
        dateRaw: "",
        institute,
        status: (row[statusKey] || "").trim(),
      })
    );
}

export async function fetchYelahankaCallingRecords(): Promise<CallingRecord[]> {
  const results = await Promise.all(SOURCES.map((s) => fetchTab(s.url, s.institute)));
  return results.flat();
}
