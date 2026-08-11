"use client";

import { colorForStream } from "@/lib/colors";

export default function StreamLegend({ streams }: { streams: string[] }) {
  if (streams.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-slate-400 bg-slate-400 dark:border-zinc-500 dark:bg-zinc-500" />
          Confirmed date
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-slate-400 bg-transparent dark:border-zinc-500" />
          Estimated date
        </span>
      </div>
      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-zinc-50">Streams</h3>
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
