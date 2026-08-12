import Papa from "papaparse";
import { findKey } from "./csvUtils";

const IELTS_SHEET_ID = "1EGSV1abOKp3XXKBOmHs8ZGi8hZ02njc24tv4_aayhwo";

// Display name -> exact tab name in the sheet. Google's gviz endpoint
// silently falls back to the default tab when `sheet=` doesn't match any
// tab exactly (no error), so this must match verbatim including case -
// the actual tabs are "Yelahanka Mock registration" and "Jayanagar Mock
// Registration", not just the branch name.
const BRANCH_TABS: Record<string, string> = {
  Yelahanka: "Yelahanka Mock registration",
  Jayanagar: "Jayanagar Mock Registration",
};

export const IELTS_BRANCHES = Object.keys(BRANCH_TABS) as IeltsBranchName[];
export type IeltsBranchName = "Yelahanka" | "Jayanagar";

export type IeltsRegistration = {
  contactNumber: string;
  caAssigned: boolean;
  testTaken: boolean;
  testTakenIn: "online" | "branch" | null;
};

function normalizeRow(row: Record<string, string>, contactKey: string, caKey: string): IeltsRegistration | null {
  const testTakenKey = findKey(row, ["after registration"]);
  const testTakenInKey = findKey(row, ["taken in"]);

  const contactNumber = (row[contactKey] || "").trim();
  if (!contactNumber) return null;

  const caAssigned = (row[caKey] || "").trim().length > 0;
  const testTaken = (row[testTakenKey] || "").trim().toUpperCase() === "TRUE";
  const testTakenInRaw = (row[testTakenInKey] || "").trim().toLowerCase();
  const testTakenIn = testTakenInRaw === "online" ? "online" : testTakenInRaw === "branch" ? "branch" : null;

  return { contactNumber, caAssigned, testTaken, testTakenIn };
}

/** Fetches one branch's sub-sheet by its exact tab name. */
async function fetchBranchSheet(branch: IeltsBranchName): Promise<IeltsRegistration[]> {
  const tabName = BRANCH_TABS[branch];
  const url = `https://docs.google.com/spreadsheets/d/${IELTS_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&_ts=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch IELTS sheet "${tabName}" (status ${res.status})`);
  }
  const text = await res.text();

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  // The two tabs use different phone-column headers ("Contact number" vs
  // "Student WhatsApp Number"); resolved once per sheet, not per row.
  const sampleRow = parsed.data[0] ?? {};
  const contactKey = findKey(sampleRow, ["contact", "whatsapp"]);
  if (!contactKey) {
    throw new Error(`Could not find a phone number column in IELTS sheet "${tabName}"`);
  }
  const caKey = findKey(sampleRow, ["ca"]);

  return parsed.data
    .map((row) => normalizeRow(row, contactKey, caKey))
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
