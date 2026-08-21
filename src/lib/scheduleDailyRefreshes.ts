const REFRESH_TIMES: Array<{ hour: number; minute: number }> = [
  { hour: 13, minute: 0 },
  { hour: 15, minute: 0 },
  { hour: 18, minute: 0 },
];

/** Schedules `callback` once for the next occurrence of hour:minute (local time), then re-schedules itself for the same time the following day. */
function scheduleAt(hour: number, minute: number, callback: () => void): () => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  function scheduleNext() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    timeoutId = setTimeout(() => {
      callback();
      scheduleNext();
    }, next.getTime() - now.getTime());
  }

  scheduleNext();
  return () => clearTimeout(timeoutId);
}

/**
 * Triggers `callback` at 1pm, 3pm, and 6pm local time, every day, for as
 * long as the page stays open in the browser - this can't wake up a closed
 * tab, so it's a complement to the manual Refresh button and the
 * always-fresh fetch-on-load, not a replacement for either. Returns a
 * cleanup function that cancels every pending timer.
 */
export function scheduleDailyRefreshes(callback: () => void): () => void {
  const cancels = REFRESH_TIMES.map((t) => scheduleAt(t.hour, t.minute, callback));
  return () => cancels.forEach((cancel) => cancel());
}
