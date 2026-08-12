import type { IeltsRegistration, IeltsSheetData } from "./fetchIeltsSheet";

export type IeltsBranchStat = {
  branch: string;
  totalRegistrations: number;
  ca: number;
  totalTestTaken: number;
  online: number;
  inBranch: number;
  caPct: number | null;
  testTakenPct: number | null;
  onlinePct: number | null;
  inBranchPct: number | null;
};

function round(n: number): number {
  return Math.round(n);
}

function pct(part: number, whole: number): number | null {
  return whole > 0 ? round((part / whole) * 100) : null;
}

/**
 * Registrations are deduped by contact number within each branch's sheet
 * (a phone can appear on multiple rows - e.g. a follow-up call log). All
 * percentages are null (shown as "—") rather than 0 when the denominator
 * is 0, so an empty sheet doesn't misleadingly read as "0%".
 */
export function computeBranchStat(branch: string, registrations: IeltsRegistration[]): IeltsBranchStat {
  const totalRegistrations = new Set(registrations.map((r) => r.contactNumber)).size;
  const ca = new Set(registrations.filter((r) => r.caAssigned).map((r) => r.contactNumber)).size;

  const taken = registrations.filter((r) => r.testTaken);
  const totalTestTaken = new Set(taken.map((r) => r.contactNumber)).size;

  const online = new Set(taken.filter((r) => r.testTakenIn === "online").map((r) => r.contactNumber)).size;
  const inBranch = new Set(taken.filter((r) => r.testTakenIn === "branch").map((r) => r.contactNumber)).size;

  return {
    branch,
    totalRegistrations,
    ca,
    totalTestTaken,
    online,
    inBranch,
    caPct: pct(ca, totalRegistrations),
    testTakenPct: pct(totalTestTaken, totalRegistrations),
    onlinePct: pct(online, totalTestTaken),
    inBranchPct: pct(inBranch, totalTestTaken),
  };
}

export function computeAllBranchStats(data: IeltsSheetData): IeltsBranchStat[] {
  return data.map(({ branch, registrations }) => computeBranchStat(branch, registrations));
}

/**
 * Simple sum across branches (not deduped cross-branch) - a student who
 * registered at both branches counts once per branch, matching how each
 * branch row itself is computed.
 */
export function computeOverallStat(branchStats: IeltsBranchStat[]): IeltsBranchStat {
  const totalRegistrations = branchStats.reduce((sum, b) => sum + b.totalRegistrations, 0);
  const ca = branchStats.reduce((sum, b) => sum + b.ca, 0);
  const totalTestTaken = branchStats.reduce((sum, b) => sum + b.totalTestTaken, 0);
  const online = branchStats.reduce((sum, b) => sum + b.online, 0);
  const inBranch = branchStats.reduce((sum, b) => sum + b.inBranch, 0);

  return {
    branch: "All branches",
    totalRegistrations,
    ca,
    totalTestTaken,
    online,
    inBranch,
    caPct: pct(ca, totalRegistrations),
    testTakenPct: pct(totalTestTaken, totalRegistrations),
    onlinePct: pct(online, totalTestTaken),
    inBranchPct: pct(inBranch, totalTestTaken),
  };
}
