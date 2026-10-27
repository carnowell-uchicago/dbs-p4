import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ds/Skeleton";
import { TextBox } from "@/components/ds/TextBox";
import { effectiveTimeZone, getProfile, getSessionsBetween, requireUser, todayKey } from "@/lib/data";
import { formatDay } from "@/lib/format";
import { buildRange, type DateRange } from "@/lib/ranges";
import { splitSessionByDay } from "@/lib/time";
import { buildTimesheet, toCsv } from "@/lib/timesheet";
import { ExportButtons } from "./ExportButtons";
import { RangeForm } from "./RangeForm";

export const metadata: Metadata = { title: "Timesheet · Trainer Timesheet" };

const mono = { fontFamily: "var(--dp-mono)" };

export default function LogPage({ searchParams }: PageProps<"/log">) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 print:max-w-none print:p-0">
      <h1 className="mb-4 text-2xl font-bold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--dp-display)" }}>
        Timesheet
      </h1>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Timesheet searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

async function Timesheet({ searchParams }: { searchParams: PageProps<"/log">["searchParams"] }) {
  const { supabase } = await requireUser();
  const profile = await getProfile(supabase);
  const timeZone = await effectiveTimeZone(profile);
  const now = new Date();
  const today = todayKey(timeZone, now);

  // Read the choice from the URL, defaulting to "the week ending today".
  const params = await searchParams;
  const preset = ["1w", "2w", "custom"].includes(one(params.preset)) ? one(params.preset) : "1w";
  const anchor = one(params.anchor) === "start" ? "start" : "end";
  const date = one(params.date) || today;
  const days = Number(one(params.days)) || 7;

  let range: DateRange;
  let problem: string | null = null;
  try {
    range =
      preset === "custom"
        ? buildRange({ preset: "custom", anchor, date, days })
        : buildRange({ preset: preset as "1w" | "2w", anchor, date });
  } catch (error) {
    problem = error instanceof Error ? error.message : "That range isn't valid.";
    range = buildRange({ preset: "1w", anchor: "end", date: today });
  }

  const rows = await getSessionsBetween(supabase, range.start, range.end, timeZone);
  const sessions = rows.map((s) => ({ clockIn: new Date(s.clock_in), clockOut: s.clock_out ? new Date(s.clock_out) : null }));
  const sheet = buildTimesheet(sessions, range, timeZone, now);

  // Notes per day, for the table and the CSV.
  const notesByDate = new Map<string, string[]>();
  for (const s of rows) {
    if (!s.note) continue;
    const first = splitSessionByDay({ clockIn: new Date(s.clock_in), clockOut: s.clock_out ? new Date(s.clock_out) : null }, timeZone, now)[0];
    if (first) notesByDate.set(first.date, [...(notesByDate.get(first.date) ?? []), s.note]);
  }

  const name = profile?.trainer_name ?? "Trainer";
  const title = `${formatDay(range.start)} – ${formatDay(range.end)}`;
  return (
    <div className="flex flex-col gap-4">
      <RangeForm preset={preset} anchor={anchor} date={date} days={days} today={today} />
      {problem && (
        <TextBox tone="error" speaker="Range" live="assertive">
          {problem} Showing the week ending today instead.
        </TextBox>
      )}

      <section aria-labelledby="sheet-h" className="rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4 print:border-0 print:p-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="sheet-h" className="text-lg font-bold" style={{ fontFamily: "var(--dp-display)" }}>
              {name} · {title}
            </h2>
            <p className="text-sm text-(--dk-muted) print:text-black" style={mono}>
              Total {sheet.totalHours.toFixed(2)} h · times in {timeZone}
            </p>
          </div>
          <ExportButtons csv={toCsv(sheet.rows, notesByDate)} filename={`timesheet-${range.start}-to-${range.end}.csv`} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm" style={mono}>
            <thead>
              <tr className="border-b-2 border-(--dk-edge) text-xs uppercase tracking-[0.08em] text-(--dk-muted) print:text-black">
                <th scope="col" className="py-2 pr-3">Date</th>
                <th scope="col" className="py-2 pr-3">First in</th>
                <th scope="col" className="py-2 pr-3">Last out</th>
                <th scope="col" className="py-2 pr-3 text-right">Sessions</th>
                <th scope="col" className="py-2 pr-3 text-right">Hours</th>
                <th scope="col" className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row) => (
                <tr key={row.date} className={`border-b border-(--dk-line) ${row.minutes === 0 ? "text-(--dk-muted) print:text-black" : ""}`}>
                  <th scope="row" className="py-2 pr-3 font-normal">{formatDay(row.date)}</th>
                  <td className="py-2 pr-3">{row.firstClockIn ?? "–"}</td>
                  <td className="py-2 pr-3">{row.running ? "running" : (row.lastClockOut ?? "–")}</td>
                  <td className="py-2 pr-3 text-right">{row.sessions}</td>
                  <td className="py-2 pr-3 text-right">{row.hours.toFixed(2)}</td>
                  <td className="py-2 font-sans text-(--dk-muted) print:text-black">{(notesByDate.get(row.date) ?? []).join("; ")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <th scope="row" colSpan={4} className="py-2 pr-3">Total</th>
                <td className="py-2 pr-3 text-right">{sheet.totalHours.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        {rows.length === 0 && <p className="mt-3 text-sm text-(--dk-muted)">No time logged in this range. Try a different week, or clock in from the dashboard.</p>}
      </section>
    </div>
  );
}
