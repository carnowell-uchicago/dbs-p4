"use server";

// Save the trainer's name, avatar and time zone. Everything from the form is checked
// here (the browser can send anything); RLS then only lets you update your own row.
import { refresh } from "next/cache";
import { requireUser } from "@/lib/data";
import { parseAvatar } from "@/lib/avatar";
import { isValidTimeZone } from "@/lib/time";

export type ProfileResult = { ok: boolean; message: string } | null;

export async function updateProfile(_prev: ProfileResult, formData: FormData): Promise<ProfileResult> {
  const { userId, supabase } = await requireUser();

  const name = String(formData.get("trainerName") ?? "").trim();
  if (name.length < 1 || name.length > 40) return { ok: false, message: "Pick a trainer name of 1 to 40 characters." };

  const avatar = parseAvatar(Object.fromEntries(formData));
  if (!avatar) return { ok: false, message: "That avatar isn't one of the options. Please pick again." };

  // "" means "use my browser's time zone" (stored as null).
  const zone = String(formData.get("timezone") ?? "");
  if (zone && !isValidTimeZone(zone)) return { ok: false, message: "That time zone isn't valid." };

  const { data, error } = await supabase
    .from("profiles")
    .update({ trainer_name: name, avatar, timezone: zone || null })
    .eq("user_id", userId) // our own Clerk ID from the server; RLS checks it again
    .select("user_id");
  if (error) return { ok: false, message: "Couldn't save your trainer. Please try again." };
  if (data.length === 0) return { ok: false, message: "No trainer to update yet: name your trainer on the dashboard first." };
  refresh();
  return { ok: true, message: `Saved! Your coaches will call you ${name}.` };
}
