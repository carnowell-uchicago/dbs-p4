"use server";

// Everything the dashboard can change. Each action checks Clerk (requireUser),
// and the database checks again: RLS (own rows only), the DB-clock trigger,
// and the no-overlap constraint. The browser never sends a user ID.
import { refresh } from "next/cache";
import { defaultAvatar } from "@/components/ds/TrainerAvatar";
import { effectiveTimeZone, getOverlapping, getProfile, getTotalXp, requireUser, type WorkSession } from "@/lib/data";
import { isValidDateKey } from "@/lib/dates";
import { formatClock, formatDay, formatDuration } from "@/lib/format";
import { atWallClock, isValidTime, toDateKey } from "@/lib/time";
import { levelUpTo } from "@/lib/xp";

// levelUp: the new trainer level, when clocking out crossed into one (for the celebration pop-up).
export type ActionResult = { ok: true; message: string; levelUp?: number } | { ok: false; message: string } | null;

const NOTE_MAX = 500;

// Postgres error codes we turn into friendly messages.
const UNIQUE_VIOLATION = "23505"; // one_running_session_per_user
const EXCLUSION_VIOLATION = "23P01"; // no_overlapping_sessions
const CHECK_VIOLATION = "23514"; // check constraints and the trigger's errors

function cleanNote(value: FormDataEntryValue | null): string | null | Error {
  const note = typeof value === "string" ? value.trim() : "";
  if (note.length > NOTE_MAX) return new Error(`Notes can be up to ${NOTE_MAX} characters (yours is ${note.length}).`);
  return note || null;
}

export async function createProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const name = String(formData.get("trainerName") ?? "").trim();
  if (name.length < 1 || name.length > 40) return { ok: false, message: "Pick a trainer name of 1 to 40 characters." };
  // user_id is filled in by the database from the Clerk token; timezone null = use the browser's.
  const { error } = await supabase.from("profiles").insert({ trainer_name: name, avatar: defaultAvatar });
  if (error && error.code !== UNIQUE_VIOLATION) return { ok: false, message: "Couldn't save your trainer. Please try again." };
  refresh();
  return { ok: true, message: `Welcome, ${name}!` };
}

export async function clockIn(): Promise<ActionResult> {
  const { supabase } = await requireUser();
  // clock_in is required by the type, but the trigger replaces it with the database's now().
  const { error } = await supabase.from("work_sessions").insert({ source: "clock", clock_in: new Date().toISOString() });
  if (error) {
    if (error.code === UNIQUE_VIOLATION || error.code === EXCLUSION_VIOLATION) {
      return { ok: false, message: "You're already clocked in." };
    }
    return { ok: false, message: "Couldn't clock in. Please try again." };
  }
  refresh();
  return { ok: true, message: "Clocked in." };
}

export async function clockOut(sessionId: string, noteValue: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const note = cleanNote(noteValue);
  if (note instanceof Error) return { ok: false, message: note.message };
  // XP before and after, to spot a level-up. The database works out the session's XP
  // (xp_minutes), so this can't be faked from the browser.
  const xpBefore = await getTotalXp(supabase);
  // The trigger sets clock_out to the database's now(); the time we send is ignored.
  const { data, error } = await supabase
    .from("work_sessions")
    .update({ clock_out: new Date().toISOString(), note })
    .eq("id", sessionId)
    .is("clock_out", null)
    .select("id");
  if (error) return { ok: false, message: "Couldn't clock out. Please try again." };
  if (data.length === 0) return { ok: false, message: "That session has already ended." };
  const levelUp = levelUpTo(xpBefore, await getTotalXp(supabase));
  refresh();
  return { ok: true, message: "Clocked out.", levelUp: levelUp ?? undefined };
}

/** "your live session on Tue, Oct 27, 9:02 AM – 11:30 AM" */
function describeSession(s: WorkSession, timeZone: string): string {
  const day = formatDay(toDateKey(new Date(s.clock_in), timeZone));
  const end = s.clock_out ? formatClock(s.clock_out, timeZone) : "now (still running)";
  const kind = s.source === "manual" ? "manual entry" : "live session";
  return `your ${kind} on ${day}, ${formatClock(s.clock_in, timeZone)} – ${end}`;
}

export async function addManualSession(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const timeZone = await effectiveTimeZone(await getProfile(supabase));

  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  if (!isValidDateKey(date)) return { ok: false, message: "Pick a date." };
  if (!isValidTime(start) || !isValidTime(end)) return { ok: false, message: "Enter a start and an end time." };
  const note = cleanNote(formData.get("note"));
  if (note instanceof Error) return { ok: false, message: note.message };

  const clockIn = atWallClock(date, start, timeZone);
  const clockOut = atWallClock(date, end, timeZone);
  if (clockOut <= clockIn) return { ok: false, message: "The end time has to be after the start time (same day)." };
  if (clockOut > new Date()) return { ok: false, message: "Manual time can't end in the future." };

  // Check first so we can say exactly what it overlaps; the database constraint is the backstop.
  const overlaps = await getOverlapping(supabase, clockIn, clockOut);
  if (overlaps.length > 0) {
    const list = overlaps.map((s) => describeSession(s, timeZone)).join("; and ");
    return { ok: false, message: `That overlaps ${list}. Pick a time outside it.` };
  }

  const { error } = await supabase
    .from("work_sessions")
    .insert({ source: "manual", clock_in: clockIn.toISOString(), clock_out: clockOut.toISOString(), note });
  if (error) {
    if (error.code === EXCLUSION_VIOLATION) return { ok: false, message: "That overlaps time you've already logged." };
    if (error.code === CHECK_VIOLATION) return { ok: false, message: "Those times aren't valid. Check the start and end." };
    return { ok: false, message: "Couldn't add that time. Please try again." };
  }
  refresh();
  const length = formatDuration(clockOut.getTime() - clockIn.getTime());
  return { ok: true, message: `Added ${length} on ${formatDay(date)}. Manual time counts toward your hours, not XP.` };
}

export async function deleteSession(sessionId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  // RLS only lets you delete your own rows; someone else's id simply matches nothing.
  const { data, error } = await supabase.from("work_sessions").delete().eq("id", sessionId).select("id");
  if (error) return { ok: false, message: "Couldn't delete that session. Please try again." };
  if (data.length === 0) return { ok: false, message: "That session was already deleted." };
  refresh();
  return { ok: true, message: "Session deleted." };
}

/** "2026-10-27T09:05" (a datetime-local value) -> that wall-clock moment in `timeZone`, or null. */
function fromLocalInput(value: FormDataEntryValue | null, timeZone: string): Date | null {
  const [date, time] = String(value ?? "").split("T");
  if (!date || !time || !isValidDateKey(date) || !isValidTime(time.slice(0, 5))) return null;
  return atWallClock(date, time.slice(0, 5), timeZone);
}

/**
 * Edit a session's times and note. A running session can only change its start and note:
 * its end comes from the database clock when you clock out. For live sessions the
 * database keeps the recorded window, so edits can lower XP but never raise it.
 */
export async function updateSession(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const timeZone = await effectiveTimeZone(await getProfile(supabase));
  const id = String(formData.get("id") ?? "");
  const running = formData.get("running") === "true";
  const note = cleanNote(formData.get("note"));
  if (note instanceof Error) return { ok: false, message: note.message };

  const start = fromLocalInput(formData.get("start"), timeZone);
  if (!start) return { ok: false, message: "Enter a start date and time." };
  const end = running ? null : fromLocalInput(formData.get("end"), timeZone);
  if (!running && !end) return { ok: false, message: "Enter an end date and time." };
  const now = new Date();
  if (start > now) return { ok: false, message: "A session can't start in the future." };
  if (end && end <= start) return { ok: false, message: "The end has to be after the start." };
  if (end && end > now) return { ok: false, message: "A session can't end in the future." };

  // Same overlap rule as adding time, ignoring the session being edited.
  const overlaps = (await getOverlapping(supabase, start, end ?? now)).filter((s) => s.id !== id);
  if (overlaps.length > 0) {
    const list = overlaps.map((s) => describeSession(s, timeZone)).join("; and ");
    return { ok: false, message: `That overlaps ${list}. Pick a time outside it.` };
  }

  const changes = running
    ? { clock_in: start.toISOString(), note }
    : { clock_in: start.toISOString(), clock_out: end!.toISOString(), note };
  // RLS limits this to your own rows: someone else's id matches nothing.
  const { data, error } = await supabase.from("work_sessions").update(changes).eq("id", id).select("id");
  if (error) {
    if (error.code === EXCLUSION_VIOLATION) return { ok: false, message: "That overlaps time you've already logged." };
    if (error.code === CHECK_VIOLATION) return { ok: false, message: "Those times aren't valid. Check the start and end." };
    return { ok: false, message: "Couldn't save that change. Please try again." };
  }
  if (data.length === 0) return { ok: false, message: "That session no longer exists." };
  refresh();
  return { ok: true, message: "Session updated." };
}
