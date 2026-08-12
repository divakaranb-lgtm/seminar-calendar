import Papa from "papaparse";
import { findKey } from "./csvUtils";

const IELTS_SHEET_ID = "1EGSV1abOKp3XXKBOmHs8ZGi8hZ02njc24tv4_aayhwo";

export const IELTS_BRANCHES = ["Yelahanka", "Jayanagar"] as const;
export type IeltsBranchName = (typeof IELTS_BRANCHES)[number];

export type IeltsRegistration = {
  contactNumber: string;
  testTaken: boolean;
  testTakenIn: "online" | "branch" | null;
};

function normalizeRow(row: Record<string, string>): IeltsRegistration | null {
  const contactKey = findKey(row, ["contact"]);
  const testTakenKey = findKey(row, ["after registration"]);
  const testTakenInKey = findKey(row, ["taken in"]);

  const contactNumber = (row[contactKey] || "").trim();
  if (!contactNumber) return null;

  const testTaken = (row[testTakenKey] || "").trim().toUpperCase() === "TRUE";
  const testTakenInRaw = (row[testTakenInKey] || "").trim().toLowerCase();
  const testTakenIn = testTakenInRaw === "online" ? "online" : testTakenInRaw === "branch" ? "branch" : null;

  return { contactNumber, testTaken, testTakenIn };
}

/** Fetches one branch's sub-sheet by tab name (works without needing to know its gid). */
async function fetchBranchSheet(branch: IeltsBranchName): Promise<IeltsRegistration[]> {
  const url = `https://docs.google.com/spreadsheets/d/${IELTS_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(branch)}&_ts=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch IELTS sheet "${branch}" (status ${res.status})`);
  }
  const text = await res.text();

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map(normalizeRow)
    .filter((r): r is IeltsRegistration => r !== null);
}

export type IeltsSheetData = { branch: IeltsBranchName; registrations: IeltsRegistration[] }[];

export async function fetchIeltsData(): Promise<IeltsSheetData> {
  return Promise.all(
    IELTS_BRANCHES.map(async (branch) => ({
      branch,
      registrations: await fetchBranchSheet(branch),
    }))
  );
}
