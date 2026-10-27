// Data access layer: the one place pages and actions read the signed-in user's data.
//
// Two locks on every read:
//   1. requireUser() checks Clerk here on the server (signed out -> sign-in page).
//   2. The Supabase client sends the Clerk token, so RLS only returns this user's rows.
// Nothing here takes a user ID from the browser.
import "server-only";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultAvatar, type Avatar } from "@/components/ds/TrainerAvatar";
import { DAILY_TIMEZONE } from "./daily-pokemon";
import { addDays } from "./dates";
import { createServerSupabase } from "./supabase/server";
import type { Tables } from "./supabase/database.types";
import { isValidTimeZone, startOfDay, toDateKey } from "./time";

export type Profile = Tables<"profiles">;
export type WorkSession = Tables<"work_sessions">;

/** Cookie the browser sets with its own time zone (see TimeZoneCookie.tsx). */
export const TZ_COOKIE = "tz";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return { userId, supabase: await createServerSupabase() };
}

type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;

export async function getProfile(supabase: Supabase): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

/** The avatar saved in the profile, with defaults for any missing part. */
export function avatarOf(profile: Profile): Avatar {
  const saved = profile.avatar && typeof profile.avatar === "object" && !Array.isArray(profile.avatar) ? profile.avatar : {};
  return { ...defaultAvatar, ...(saved as Partial<Avatar>) };
}

/**
 * The zone used to group hours by day:
 * the profile's saved choice, else the browser's zone (cookie), else Chicago.
 */
export async function effectiveTimeZone(profile: Profile | null): Promise<string> {
  if (profile?.timezone && isValidTimeZone(profile.timezone)) return profile.timezone;
  const fromBrowser = (await cookies()).get(TZ_COOKIE)?.value;
  if (fromBrowser && isValidTimeZone(fromBrowser)) return fromBrowser;
  return DAILY_TIMEZONE;
}

/** Sessions that touch any day from `firstDay` to `lastDay` (both included) in `timeZone`, oldest first. */
export async function getSessionsBetween(supabase: Supabase, firstDay: string, lastDay: string, timeZone: string): Promise<WorkSession[]> {
  const rangeStart = startOfDay(firstDay, timeZone).toISOString();
  const rangeEnd = startOfDay(addDays(lastDay, 1), timeZone).toISOString();
  const { data, error } = await supabase
    .from("work_sessions")
    .select("*")
    .lt("clock_in", rangeEnd)
    .or(`clock_out.is.null,clock_out.gt.${rangeStart}`)
    .order("clock_in");
  if (error) throw error;
  return data;
}

export async function getRunningSession(supabase: Supabase): Promise<WorkSession | null> {
  const { data, error } = await supabase.from("work_sessions").select("*").is("clock_out", null).maybeSingle();
  if (error) throw error;
  return data;
}

/** Lifetime XP: the sum of every session's xp_minutes (worked out by the database). */
export async function getTotalXp(supabase: Supabase): Promise<number> {
  const { data, error } = await supabase.from("work_sessions").select("xp_minutes");
  if (error) throw error;
  return data.reduce((sum, row) => sum + (row.xp_minutes ?? 0), 0);
}

/** Sessions that overlap [start, end), for the "that overlaps…" message. */
export async function getOverlapping(supabase: Supabase, start: Date, end: Date): Promise<WorkSession[]> {
  const { data, error } = await supabase
    .from("work_sessions")
    .select("*")
    .lt("clock_in", end.toISOString())
    .or(`clock_out.is.null,clock_out.gt.${start.toISOString()}`)
    .order("clock_in");
  if (error) throw error;
  return data;
}

export function todayKey(timeZone: string, now: Date): string {
  return toDateKey(now, timeZone);
}
