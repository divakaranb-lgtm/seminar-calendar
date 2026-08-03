import Papa from "papaparse";
import { parseSeminarDate } from "./parseDate";
import { parseTentativeDate } from "./parseTentativeDate";
import type { Seminar, SeminarStatus } from "./types";

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQenadlrDcSBEWPRLoAyhquOUx9G2a-voTICgLX_xX7NL158Vd_YnxOGiB5ATPZdQOdts3_s4Q5lGp4/pub?gid=0&single=true&output=csv";

const FINALISED_VALUES = new Set(["finalised", "finalized", "confirmed", "final"]);

function findKey(row: Record<string, string>, needles: string[], exclude: Set<string> = new Set()): string {
  const keys = Object.keys(row).filter((k) => !exclude.has(k));
  for (const needle of needles) {
    const found = keys.find((k) => k.toLowerCase().includes(needle));
    if (found) return found;
  }
  return "";
}

function resolveStatusAndDate(
  statusRaw: string,
  dateRaw: string
): { status: SeminarStatus; date: Date | null } {
  const statusKey = statusRaw.trim().toLowerCase();

  if (FINALISED_VALUES.has(statusKey)) {
    const date = parseSeminarDate(dateRaw);
    return { status: date ? "finalised" : "unscheduled", date };
  }

  if (statusKey) {
    const tentativeDate = parseTentativeDate(statusRaw);
    return tentativeDate
      ? { status: "tentative", date: tentativeDate }
      : { status: "unscheduled", date: null };
  }

  // No status text at all: fall back to whatever is in the date column.
  const date = parseSeminarDate(dateRaw);
  return { status: date ? "finalised" : "unscheduled", date };
}

function normalizeRow(row: Record<string, string>, index: number): Seminar | null {
  const collegeKey = findKey(row, ["college"]);
  const statusKey = findKey(row, ["status"]);
  const dateKey = findKey(row, ["date"], new Set([statusKey]));
  const streamKey = findKey(row, ["stream"]);
  const studentsKey = findKey(row, ["student"]);
  const bdmKey = findKey(row, ["bdm"]);
  const speakerKey = findKey(row, ["speaker"]);
  const branchKey = findKey(row, ["branch"]);

  const collegeName = (row[collegeKey] || "").trim();
  if (!collegeName) return null;

  const statusRaw = (row[statusKey] || "").trim();
  const dateRaw = (row[dateKey] || "").trim();
  const { status, date } = resolveStatusAndDate(statusRaw, dateRaw);

  const streams = (row[streamKey] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: `${index}-${collegeName}`,
    collegeName,
    status,
    statusRaw,
    dateRaw,
    date,
    streams,
    noOfStudents: (row[studentsKey] || "").trim(),
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
