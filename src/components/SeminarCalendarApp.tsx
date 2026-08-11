"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { fetchSeminars } from "@/lib/fetchSeminars";
import { fetchCallingRecords } from "@/lib/fetchCallingSheet";
import { enrichWithCallingStats } from "@/lib/matchCalling";
import { sortByStatusPriority } from "@/lib/funnel";
import type { Seminar } from "@/lib/types";
import MonthCalendar from "./MonthCalendar";
import DayPanel from "./DayPanel";
import UnscheduledList from "./UnscheduledList";
import StreamLegend from "./StreamLegend";
import SummaryDashboard from "./SummaryDashboard";
import BdmBreakdown from "./BdmBreakdown";
import QuickStats from "./QuickStats";

/**
 * The calling sheet is a secondary, non-critical data source (Prospects /
 * Future Intake only) - if it fails to load, seminars still render with
 * those stats simply unavailable ("—") instead of failing the whole page.
 */
async function loadData(): Promise<Seminar[]> {
  const seminars = await fetchSeminars();
  try {
    const callingRecords = await fetchCallingRecords();
    return enrichWithCallingStats(seminars, callingRecords);
  } catch (err) {
    console.error("Failed to fetch calling sheet; Prospects/Future Intake will be unavailable.", err);
    return seminars;
  }
}

export default function SeminarCalendarApp() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    loadData()
      .then((data) => {
        setSeminars(data);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Initial state is already loading=true/error=null, so just kick off the
    // fetch here instead of routing through load() (which sets those
    // synchronously and would cause a cascading render on mount).
    loadData()
      .then((data) => {
        setSeminars(data);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => setLoading(false));
  }, []);

  const scheduled = useMemo(() => seminars.filter((s) => s.date !== null), [seminars]);
  const unscheduled = useMemo(() => seminars.filter((s) => s.date === null), [seminars]);

  const seminarsByDay = useMemo(() => {
    const map = new Map<string, Seminar[]>();
    for (const seminar of scheduled) {
      const key = format(seminar.date as Date, "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      existing.push(seminar);
      map.set(key, existing);
    }
    for (const [key, group] of map) {
      map.set(key, sortByStatusPriority(group));
    }
    return map;
  }, [scheduled]);

  const streams = useMemo(() => {
    const set = new Set<string>();
    for (const seminar of seminars) {
      const list = seminar.streams.length > 0 ? seminar.streams : ["Unspecified"];
      for (const stream of list) set.add(stream);
    }
    return Array.from(set).sort();
  }, [seminars]);

  const selectedDaySeminars = useMemo(() => {
    if (!selectedDate) return [];
    return sortByStatusPriority(scheduled.filter((s) => isSameDay(s.date as Date, selectedDate)));
  }, [scheduled, selectedDate]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-1 sm:mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 sm:text-3xl">
          Seminar Pipeline Dashboard
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
          {loading ? (
            <span>Loading latest seminar data…</span>
          ) : error ? (
            <span className="text-red-600 dark:text-red-400">{error}</span>
          ) : (
            lastUpdated && <span>Updated {format(lastUpdated, "h:mm a")}</span>
          )}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="ml-auto rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && !loading && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          Couldn&apos;t load seminar data. {error}
        </div>
      )}

      <QuickStats seminars={seminars} />

      <SummaryDashboard seminars={seminars} />

      <div className="space-y-5">
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          seminarsByDay={seminarsByDay}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <StreamLegend streams={streams} />

        <UnscheduledList seminars={unscheduled} />
      </div>

      <BdmBreakdown seminars={seminars} />

      {selectedDate && (
        <DayPanel
          date={selectedDate}
          seminars={selectedDaySeminars}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
