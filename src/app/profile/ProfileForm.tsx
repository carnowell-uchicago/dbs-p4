"use client";

// The trainer editor: name, look (with a live preview), and time zone.
// The choices are sent as plain form fields; the server checks every one.
import { useActionState, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ds/Button";
import { focusRing } from "@/components/ds/classes";
import { Field } from "@/components/ds/Field";
import { Segmented } from "@/components/ds/Segmented";
import { SwatchPicker } from "@/components/ds/SwatchPicker";
import { TextBox } from "@/components/ds/TextBox";
import { avatarOptions, TrainerAvatar, type Avatar } from "@/components/ds/TrainerAvatar";
import { updateProfile, type ProfileResult } from "./actions";

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ProfileForm({
  name: savedName,
  avatar: savedAvatar,
  timezone: savedZone,
  zones,
}: {
  name: string;
  avatar: Avatar;
  timezone: string | null;
  zones: string[];
}) {
  const [name, setName] = useState(savedName);
  const [avatar, setAvatar] = useState(savedAvatar);
  const [zone, setZone] = useState(savedZone ?? "");
  const [result, formAction, pending] = useActionState<ProfileResult, FormData>(updateProfile, null);
  const set = (part: Partial<Avatar>) => setAvatar((a) => ({ ...a, ...part }));
  // The device's zone: "" while rendering on the server (its zone would differ), the real
  // one in the browser. useSyncExternalStore gives each side its own value without a mismatch.
  const browserZone = useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "",
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
      {/* Live preview */}
      <div className="neon-panel flex min-w-0 flex-col items-center gap-3 self-start rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-6">
        <div className="relative flex h-48 w-36 items-end justify-center">
          <span aria-hidden className="absolute bottom-0 h-4 w-24 rounded-[50%] bg-black/55" />
          <div className="relative mb-1.5">
            <TrainerAvatar avatar={avatar} size={112} label={`Preview of ${name || "your trainer"}`} />
          </div>
        </div>
        <div className="w-full max-w-64">
          <TextBox speaker="Today's coach">{`${(name || "Trainer").toUpperCase()}, I choose you!`}</TextBox>
        </div>
      </div>

      <div className="neon-panel flex min-w-0 flex-col gap-5 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-5">
        <Field
          label="What should your coaches call you?"
          name="trainerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          maxLength={40}
          autoComplete="nickname"
          hint="1 to 40 characters. Shown on your plate and in every text box."
        />

        <SwatchPicker label="Skin" colors={avatarOptions.skin} value={avatar.skin} onChange={(skin) => set({ skin })} />
        <div className="flex flex-wrap items-end gap-5">
          <Segmented label="Hair" value={avatar.hair} onChange={(hair) => set({ hair: hair as Avatar["hair"] })} options={avatarOptions.hair.map((h) => ({ value: h, label: label(h) }))} />
          <SwatchPicker label="Hair colour" colors={avatarOptions.hairColor} value={avatar.hairColor} onChange={(hairColor) => set({ hairColor })} />
        </div>
        <div className="flex flex-wrap items-end gap-5">
          <Segmented label="Hat" value={avatar.hat} onChange={(hat) => set({ hat: hat as Avatar["hat"] })} options={avatarOptions.hat.map((h) => ({ value: h, label: label(h) }))} />
          {avatar.hat !== "none" && (
            <SwatchPicker label="Hat colour" colors={avatarOptions.color} value={avatar.hatColor} onChange={(hatColor) => set({ hatColor })} />
          )}
        </div>
        <SwatchPicker label="Outfit" colors={avatarOptions.color} value={avatar.outfit} onChange={(outfit) => set({ outfit })} />

        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor="tz" className="text-xs font-bold uppercase tracking-[0.08em] text-(--dk-muted)" style={{ fontFamily: "var(--dp-mono)" }}>
            Time zone (decides which day your hours count toward)
          </label>
          <select
            id="tz"
            name="timezone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className={`h-10 max-w-sm rounded-(--dk-r-md) border-2 border-(--dk-edge) bg-(--dk-panel) px-3 text-sm text-(--dk-ice) [color-scheme:dark] hover:border-(--dk-diamond) ${focusRing}`}
            style={{ fontFamily: "var(--dp-mono)" }}
          >
            <option value="">Automatic (this device: {browserZone || "detecting…"})</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* The avatar travels as plain fields; the server checks each one. */}
        {Object.entries(avatar).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save trainer"}
          </Button>
        </div>
        {result && (
          <TextBox tone={result.ok ? "success" : "error"} speaker={result.ok ? "Saved" : "Can't save"} live={result.ok ? "polite" : "assertive"}>
            {result.message}
          </TextBox>
        )}
      </div>
    </form>
  );
}
