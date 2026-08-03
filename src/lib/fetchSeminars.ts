import Papa from "papaparse";
import { parseSeminarDate } from "./parseDate";
import type { Seminar } from "./types";

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQenadlrDcSBEWPRLoAyhquOUx9G2a-voTICgLX_xX7NL158Vd_YnxOGiB5ATPZdQOdts3_s4Q5lGp4/pub?gid=0&single=true&output=csv";

function findKey(row: Record<string, string>, needles: string[]): string {
  const keys = Object.keys(row);
  for (const needle of needles) {
    const found = keys.find((k) => k.toLowerCase().includes(needle));
    if (found) return found;
  }
  return "";
}

function normalizeRow(row: Record<string, string>, index: number): Seminar | null {
  const collegeKey = findKey(row, ["college"]);
  const dateKey = findKey(row, ["date"]);
  const streamKey = findKey(row, ["stream"]);
  const studentsKey = findKey(row, ["student"]);
  const bdmKey = findKey(row, ["bdm"]);
  const speakerKey = findKey(row, ["speaker"]);
  const branchKey = findKey(row, ["branch"]);

  const collegeName = (row[collegeKey] || "").trim();
  if (!collegeName) return null;

  const dateRaw = (row[dateKey] || "").trim();

  return {
    id: `${index}-${collegeName}`,
    collegeName,
    dateRaw,
    date: parseSeminarDate(dateRaw),
    stream: (row[streamKey] || "").trim(),
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
