import Papa from "papaparse";
import { findKey } from "./csvUtils";

export const CALLING_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/128bLvDfa86CcsWK25otz1yKFXpHpCLXc/export?format=csv&gid=1950323642";

export type CallingRecord = {
  dateRaw: string;
  institute: string;
  status: string;
};

function normalizeRow(row: Record<string, string>): CallingRecord | null {
  const instituteKey = findKey(row, ["institute"]);
  const statusKey = findKey(row, ["status"]);
  const dateKey = findKey(row, ["date"]);

  const institute = (row[instituteKey] || "").trim();
  if (!institute) return null;

  return {
    dateRaw: (row[dateKey] || "").trim(),
    institute,
    status: (row[statusKey] || "").trim(),
  };
}

/**
 * The "calling sheet" is a separate log of individual students called after
 * completed seminars, one row per student. It's the source of truth for
 * Prospects and Future Intake counts, since the main sheet's own Prospect
 * column is never filled in.
 */
export async function fetchCallingRecords(): Promise<CallingRecord[]> {
  const url = `${CALLING_SHEET_CSV_URL}&_ts=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch calling sheet (status ${res.status})`);
  }
  const text = await res.text();

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map(normalizeRow)
    .filter((r): r is CallingRecord => r !== null);
}
