import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ds/Skeleton";
import { avatarOf, getProfile, requireUser } from "@/lib/data";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Your trainer · Trainer Timesheet" };

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="neon-text mb-4 text-2xl font-bold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--dp-display)" }}>
        Your trainer
      </h1>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Editor />
      </Suspense>
    </main>
  );
}

async function Editor() {
  const { supabase } = await requireUser();
  const profile = await getProfile(supabase);
  if (!profile) redirect("/dashboard"); // new users name their trainer there first
  return (
    <ProfileForm
      name={profile.trainer_name}
      avatar={avatarOf(profile)}
      timezone={profile.timezone}
      zones={Intl.supportedValuesOf("timeZone")}
    />
  );
}
