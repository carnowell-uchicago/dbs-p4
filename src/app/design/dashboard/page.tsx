// The dashboard with sample data, so it can be seen and redesigned without signing in.
// Uses the same components as /dashboard; the Poké Ball is the demo version (nothing saved).
import type { Metadata } from "next";
import { avatarOptions, type Avatar } from "@/components/ds/TrainerAvatar";
import type { Tables } from "@/lib/supabase/database.types";
import { TodaySessions } from "@/app/dashboard/TodaySessions";
import { BattleDemo } from "./BattleDemo";

export const metadata: Metadata = { title: "Dashboard preview · Dusk" };

const avatar: Avatar = { skin: avatarOptions.skin[2], hair: "short", hairColor: avatarOptions.hairColor[1], hat: "cap", hatColor: avatarOptions.color[0], outfit: avatarOptions.color[1] };
const TZ = "America/Chicago";
const row = (id: string, clockIn: string, clockOut: string | null, source: string, note: string | null): Tables<"work_sessions"> => ({
  id, user_id: "demo", clock_in: clockIn, clock_out: clockOut, source, note, recorded_in: null, recorded_out: null, xp_minutes: 0, created_at: clockIn,
});
const sessions = [
  row("1", "2026-10-27T14:02:00Z", "2026-10-27T16:30:00Z", "clock", "Q3 report draft"),
  row("2", "2026-10-27T17:15:00Z", "2026-10-27T18:00:00Z", "manual", "Client call (forgot to clock in)"),
];

export default function DashboardPreview() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <p className="mb-4 text-xs text-(--dk-gold)" style={{ fontFamily: "var(--dp-mono)" }}>
        PREVIEW · sample data · press the Poké Ball
      </p>
      <BattleDemo avatar={avatar} />
      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <TodaySessions sessions={sessions} timeZone={TZ} today="2026-10-27" now={new Date("2026-10-27T19:00:00Z")} />
        <details className="h-fit rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
          <summary className="text-sm font-bold uppercase tracking-[0.08em] text-(--dk-diamond)" style={{ fontFamily: "var(--dp-display)" }}>
            + Add time manually
          </summary>
        </details>
      </div>
    </main>
  );
}
