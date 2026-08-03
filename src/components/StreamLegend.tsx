"use client";

import { colorForStream } from "@/lib/colors";

export default function StreamLegend({ streams }: { streams: string[] }) {
  if (streams.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Streams</h3>
      <div className="flex flex-wrap gap-2">
        {streams.map((stream) => {
          const color = colorForStream(stream);
          return (
            <span
              key={stream}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color.dot }}
              />
              {stream}
            </span>
          );
        })}
      </div>
    </div>
  );
}
