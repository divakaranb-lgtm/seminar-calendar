import Papa from "papaparse";
import { parseSeminarDate } from "./parseDate";
import { parseTentativeDate } from "./parseTentativeDate";
import type { DateSource, Seminar } from "./types";

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQenadlrDcSBEWPRLoAyhquOUx9G2a-voTICgLX_xX7NL158Vd_YnxOGiB5ATPZdQOdts3_s4Q5lGp4/pub?gid=0&single=true&output=csv";

function findKey(row: Record<string, string>, needles: string[], exclude: Set<string> = new Set()): string {
  const keys = Object.keys(row).filter((k) => !exclude.has(k));
  for (const needle of needles) {
    const found = keys.find((k) => k.toLowerCase().includes(needle));
    if (found) return found;
  }
  return "";
}

/**
 * The status column's text is arbitrary (Finalised, Postponed, Cancelled,
 * Done, "Next Month", "yet to confirm", ...) and shown verbatim in the UI,
 * so date placement doesn't hardcode a list of known status words: a real
 * date in the date column always wins. Otherwise, free-form week/day text
 * like "August 1st week" or "2nd week of Aug" is checked for — normally
 * it lives in the date column itself, but the status column is checked
 * too as a fallback since the sheet has put it there before.
 */
function resolveDate(
  statusRaw: string,
  dateRaw: string
): { date: Date | null; dateSource: DateSource | null } {
  const explicitDate = parseSeminarDate(dateRaw);
  if (explicitDate) return { date: explicitDate, dateSource: "explicit" };

  const estimatedDate = parseTentativeDate(dateRaw) ?? parseTentativeDate(statusRaw);
  if (estimatedDate) return { date: estimatedDate, dateSource: "estimated" };

  return { date: null, dateSource: null };
}

function normalizeRow(row: Record<string, string>, index: number): Seminar | null {
  const collegeKey = findKey(row, ["college"]);
  const statusKey = findKey(row, ["status"]);
  const dateKey = findKey(row, ["date"], new Set([statusKey]));
  const streamKey = findKey(row, ["stream"]);
  const studentsKey = findKey(row, ["student"]);
  const prospectsKey = findKey(row, ["prospect"]);
  const walkInsKey = findKey(row, ["walk"]);
  const lockInsKey = findKey(row, ["lock"]);
  const bdmKey = findKey(row, ["bdm"]);
  const speakerKey = findKey(row, ["speaker"]);
  const branchKey = findKey(row, ["branch"]);

  const collegeName = (row[collegeKey] || "").trim();
  if (!collegeName) return null;

  const statusRaw = (row[statusKey] || "").trim();
  const dateRaw = (row[dateKey] || "").trim();
  const { date, dateSource } = resolveDate(statusRaw, dateRaw);

  const streams = (row[streamKey] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: `${index}-${collegeName}`,
    collegeName,
    statusRaw,
    dateRaw,
    date,
    dateSource,
    streams,
    noOfStudents: (row[studentsKey] || "").trim(),
    prospects: (row[prospectsKey] || "").trim(),
    walkIns: (row[walkInsKey] || "").trim(),
    lockIns: (row[lockInsKey] || "").trim(),
    bdm: (row[bdmKey] || "").trim(),
    speaker: (row[speakerKey] || "").trim(),
    closestBranch: (row[branchKey] || "").trim(),
  };
}

export async function fetchSeminars(): Promise<Seminar[]> {
  const url = `${CSV_URL}&_ts=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch seminar sheet (status ${res.status})`);
  }
  const text = await res.text();

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map((row, i) => normalizeRow(row, i))
    .filter((s): s is Seminar => s !== null);
}
