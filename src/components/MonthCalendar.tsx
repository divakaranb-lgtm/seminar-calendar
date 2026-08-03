"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { colorForStream } from "@/lib/colors";
import type { Seminar } from "@/lib/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  month: Date;
  onMonthChange: (month: Date) => void;
  seminarsByDay: Map<string, Seminar[]>;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

export default function MonthCalendar({
  month,
  onMonthChange,
  seminarsByDay,
  selectedDate,
  onSelectDate,
}: Props) {
  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(subMonths(month, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date())}
            className="rounded-lg px-2.5 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 sm:text-sm">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const seminars = seminarsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          const today = isToday(day);
          const uniqueStreams = Array.from(
            new Set(seminars.map((s) => s.stream || "Unspecified"))
          );

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelectDate(day)}
              disabled={seminars.length === 0}
              className={[
                "flex aspect-square flex-col items-center justify-start rounded-xl border p-1 text-xs transition sm:p-1.5 sm:text-sm",
                inMonth ? "text-slate-900" : "text-slate-300",
                selected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-transparent hover:bg-slate-50",
                seminars.length === 0 ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full sm:h-7 sm:w-7",
                  today ? "bg-slate-900 font-semibold text-white" : "",
                ].join(" ")}
              >
                {format(day, "d")}
              </span>
              {seminars.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center justify-center gap-0.5">
                  {uniqueStreams.slice(0, 4).map((stream) => (
                    <span
                      key={stream}
                      className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
                      style={{ backgroundColor: colorForStream(stream).dot }}
                    />
                  ))}
                  {seminars.length > 1 && (
                    <span className="ml-0.5 hidden text-[10px] font-medium text-slate-400 sm:inline">
                      {seminars.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
