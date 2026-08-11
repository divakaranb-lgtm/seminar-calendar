"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { colorForStream } from "@/lib/colors";
import { statusTint } from "@/lib/statusTint";
import type { Seminar } from "@/lib/types";

type Props = {
  date: Date;
  seminars: Seminar[];
  onClose: () => void;
};

export default function DayPanel({ date, seminars, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-h-[80vh] sm:w-[480px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {format(date, "EEEE")}
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              {format(date, "MMMM d, yyyy")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {seminars.length === 0 ? (
            <p className="text-sm text-slate-500">No seminars on this date.</p>
          ) : (
            seminars.map((seminar) => {
              const streams = seminar.streams.length > 0 ? seminar.streams : ["Unspecified"];
              const color = colorForStream(streams[0]);
              const estimated = seminar.dateSource === "estimated";
              return (
                <div
                  key={seminar.id}
                  className="rounded-xl border p-3.5"
                  style={{ borderColor: color.ring, backgroundColor: color.bg }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {seminar.collegeName}
                    </h4>
                    {seminar.statusRaw && (
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          statusTint(seminar.statusRaw),
                        ].join(" ")}
                      >
                        {seminar.statusRaw}
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1">
                    {streams.map((stream) => (
                      <span
                        key={stream}
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ color: colorForStream(stream).text, backgroundColor: "white" }}
                      >
                        {stream}
                      </span>
                    ))}
                  </div>

                  {estimated && (
                    <p className="mb-2 text-xs text-slate-500">
                      Date estimated from status: {seminar.statusRaw}
                    </p>
                  )}

                  <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-slate-600">
                    <Detail label="Students addressed" value={seminar.noOfStudents} />
                    <Detail
                      label="Prospects"
                      value={seminar.callingMatchCount > 0 ? String(seminar.callingProspects) : ""}
                    />
                    <Detail
                      label="Future Intake"
                      value={seminar.callingMatchCount > 0 ? String(seminar.callingFutureIntake) : ""}
                    />
                    <Detail label="Walk-ins" value={seminar.walkIns} />
                    <Detail label="Lock-ins" value={seminar.lockIns} />
                  </dl>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-black/5 pt-2.5 text-sm text-slate-600">
                    <Detail label="BDM" value={seminar.bdm} />
                    <Detail label="Speaker" value={seminar.speaker} />
                  </dl>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}
