"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { fetchSeminars } from "@/lib/fetchSeminars";
import type { Seminar } from "@/lib/types";
import MonthCalendar from "./MonthCalendar";
import DayPanel from "./DayPanel";
import UnscheduledList from "./UnscheduledList";
import StreamLegend from "./StreamLegend";

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
    fetchSeminars()
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
    fetchSeminars()
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
    return map;
  }, [scheduled]);

  const streams = useMemo(() => {
    const set = new Set<string>();
    for (const seminar of seminars) {
      set.add(seminar.stream || "Unspecified");
    }
    return Array.from(set).sort();
  }, [seminars]);

  const selectedDaySeminars = useMemo(() => {
    if (!selectedDate) return [];
    return scheduled.filter((s) => isSameDay(s.date as Date, selectedDate));
  }, [scheduled, selectedDate]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-1 sm:mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Seminar Calendar
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {loading ? (
            <span>Loading latest seminar data…</span>
          ) : error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <span>
              {scheduled.length} scheduled · {unscheduled.length} pending a date
              {lastUpdated && <> · updated {format(lastUpdated, "h:mm a")}</>}
            </span>
          )}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="ml-auto rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && !loading && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load seminar data. {error}
        </div>
      )}

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
