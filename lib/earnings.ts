export const POINTS_PER_OK_CHECK = 25;
export const POINTS_PER_MB = 5;

export type EarnResult = {
  statusCode: number;
  bytes: number;
  review: string;
  potentialPoints?: number;
};

export function checkSucceeded(statusCode: number) {
  return statusCode >= 200 && statusCode < 400;
}

export function potentialPoints(statusCode: number, bytes: number) {
  if (!checkSucceeded(statusCode)) return 0;
  const mb = Math.max(0, bytes) / (1024 * 1024);
  return POINTS_PER_OK_CHECK + Math.round(mb * POINTS_PER_MB);
}

export function pointsToAfk(points: number) {
  return points / 100;
}

export function recordedPoints(row: EarnResult) {
  if (typeof row.potentialPoints === 'number' && row.potentialPoints > 0) return row.potentialPoints;
  return potentialPoints(row.statusCode, row.bytes);
}

export function summarizeEarnings(results: EarnResult[]) {
  let pending = 0;
  let accepted = 0;
  let voided = 0;
  for (const row of results) {
    const points = recordedPoints(row);
    if (row.review === 'accepted') accepted += points;
    else if (row.review === 'rejected') voided += points;
    else pending += points;
  }
  const okChecks = results.filter(r => checkSucceeded(r.statusCode)).length;
  const milestones = [1, 10, 25, 50, 100, 250];
  const next = milestones.find(n => okChecks < n) ?? null;
  const previous = [...milestones].reverse().find(n => okChecks >= n) ?? 0;
  return {
    pendingAfk: pointsToAfk(pending),
    acceptedAfk: pointsToAfk(accepted),
    voidedAfk: pointsToAfk(voided),
    potentialAfk: pointsToAfk(pending + accepted),
    okChecks,
    nextMilestone: next,
    milestoneFrom: previous,
    ratePerCheck: pointsToAfk(POINTS_PER_OK_CHECK),
    ratePerMb: pointsToAfk(POINTS_PER_MB)
  };
}
