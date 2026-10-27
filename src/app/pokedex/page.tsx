import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ds/Button";
import { focusRing } from "@/components/ds/classes";
import { Field } from "@/components/ds/Field";
import { Segmented } from "@/components/ds/Segmented";
import { Skeleton } from "@/components/ds/Skeleton";
import { Badge, TypeTag } from "@/components/ds/Tag";
import { TextBox } from "@/components/ds/TextBox";
import { RetryButton } from "@/app/dashboard/RetryButton";
import { coachHistory, type CoachDay } from "@/lib/coach-history";
import { effectiveTimeZone, getAllSessionTimes, getProfile, requireUser } from "@/lib/data";
import { formatDay, formatDuration } from "@/lib/format";
import { getOriginalPokedex, getPokemon, type PokedexEntry, type Pokemon } from "@/lib/pokeapi";
import { searchPokedex, suggestName } from "@/lib/pokedex-search";
import { spriteUrl } from "@/lib/sprites";

export const metadata: Metadata = { title: "Coach Pokédex · Trainer Timesheet" };

const display = { fontFamily: "var(--dp-display)" };
const mono = { fontFamily: "var(--dp-mono)" };
const panel = "neon-panel rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel)";

type Params = PageProps<"/pokedex">["searchParams"];

export default function PokedexPage({ searchParams }: PageProps<"/pokedex">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="neon-text text-2xl font-bold uppercase tracking-[0.06em]" style={display}>
        Coach Pokédex
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-(--dk-muted)">
        Every day a different Pokémon from the original 151 coaches everyone. Search for one, and see which coaches have trained you.
      </p>
      <Suspense fallback={<PokedexSkeleton />}>
        <Pokedex searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** A link to this page with the given search state. */
function href(state: { q?: string; show?: string; id?: number }) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.show && state.show !== "all") params.set("show", state.show);
  if (state.id) params.set("id", String(state.id));
  const query = params.toString();
  return `/pokedex${query ? `?${query}` : ""}`;
}

async function Pokedex({ searchParams }: { searchParams: Params }) {
  const { supabase } = await requireUser();
  const timeZone = await effectiveTimeZone(await getProfile(supabase));
  const now = new Date();
  const params = await searchParams;
  const q = one(params.q).trim().slice(0, 40);
  const show = one(params.show) === "met" ? "met" : "all";
  const selected = Number(one(params.id)) || null;

  // The name list comes from PokéAPI (cached on the server). If it's down, say so.
  let entries: PokedexEntry[];
  try {
    entries = await getOriginalPokedex();
  } catch {
    return (
      <div className="mt-6">
        <TextBox tone="error" speaker="Pokédex" live="polite" action={<RetryButton />}>
          The Pokédex can&apos;t reach PokéAPI right now, so the list can&apos;t load. Your hours and the clock are not affected.
        </TextBox>
      </div>
    );
  }

  const history = coachHistory(await getAllSessionTimes(supabase), timeZone, now);
  const matches = searchPokedex(entries, q).filter((e) => show === "all" || history.has(e.id));
  const suggestion = matches.length === 0 && q ? suggestName(entries, q) : null;

  return (
    <div className="mt-5 flex flex-col gap-5">
      <form method="get" className={`${panel} flex flex-wrap items-end gap-4 p-4`}>
        <Field label="Search by name or number" name="q" defaultValue={q} placeholder="e.g. Pikachu or 25" maxLength={40} className="min-w-56 flex-1" />
        <Segmented
          label="Show"
          name="show"
          defaultValue={show}
          options={[
            { value: "all", label: "All 151" },
            { value: "met", label: "Coached me" },
          ]}
        />
        <Button type="submit">Search</Button>
      </form>

      {selected && entries.some((e) => e.id === selected) && (
        <Suspense key={selected} fallback={<Skeleton className="h-56 w-full" />}>
          <Detail id={selected} days={history.get(selected) ?? []} closeHref={href({ q, show })} />
        </Suspense>
      )}

      <p className="text-sm text-(--dk-muted)" style={mono} aria-live="polite">
        {matches.length === 151 ? "All 151" : `${matches.length} of 151`} · you&apos;ve met {history.size} {history.size === 1 ? "coach" : "coaches"}
      </p>

      {matches.length === 0 ? (
        <NothingFound q={q} show={show} suggestion={suggestion} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {matches.map((e) => {
            const days = history.get(e.id);
            return (
              <li key={e.id}>
                <Link
                  href={`${href({ q, show, id: e.id })}#detail`}
                  aria-current={selected === e.id ? "true" : undefined}
                  className={`${panel} flex h-full flex-col items-center gap-1 p-3 text-center hover:border-(--dk-sky) hover:bg-(--dk-raised) aria-[current=true]:border-(--dk-diamond) ${focusRing}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={spriteUrl(e.id)}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    className={`[image-rendering:pixelated] ${days ? "" : "opacity-60 grayscale"}`}
                  />
                  <span className="text-xs text-(--dk-muted)" style={mono}>
                    #{String(e.id).padStart(3, "0")}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-[0.04em]" style={display}>
                    {e.displayName}
                  </span>
                  {days ? (
                    <Badge kind="level">{`Coached you · ${days.length} ${days.length === 1 ? "day" : "days"}`}</Badge>
                  ) : (
                    <span className="text-xs text-(--dk-muted)">Not met yet</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NothingFound({ q, show, suggestion }: { q: string; show: string; suggestion: PokedexEntry | null }) {
  if (!q) {
    // "Coached me" with no coaches yet.
    return (
      <TextBox speaker="Pokédex">
        You haven&apos;t met any coaches yet. Clock in on the dashboard and today&apos;s coach will join your Pokédex!
      </TextBox>
    );
  }
  return (
    <TextBox
      speaker="Pokédex"
      live="polite"
      action={
        <>
          {suggestion && (
            <Link href={href({ q: suggestion.displayName, show })} className={`rounded-(--dk-r-md) border-2 border-(--dk-void) px-3 py-1 text-sm font-bold ${focusRing}`} style={display}>
              ▸ Did you mean {suggestion.displayName}?
            </Link>
          )}
          <Link href={href({ show })} className={`rounded-(--dk-r-md) px-3 py-1 text-sm underline underline-offset-2 ${focusRing}`}>
            Clear search
          </Link>
        </>
      }
    >
      {show === "met" ? `None of the coaches you've met match "${q}".` : `No Pokémon named "${q}" in the original 151.`}
    </TextBox>
  );
}

/** One Pokémon in detail: a single cached PokéAPI call. */
async function Detail({ id, days, closeHref }: { id: number; days: CoachDay[]; closeHref: string }) {
  let pokemon: Pokemon | null = null;
  try {
    pokemon = await getPokemon(id);
  } catch {
    pokemon = null;
  }
  if (!pokemon) {
    return (
      <TextBox tone="error" speaker="Pokédex" live="polite" action={<RetryButton />}>
        Couldn&apos;t load #{String(id).padStart(3, "0")} from PokéAPI right now.
      </TextBox>
    );
  }
  const total = days.reduce((sum, d) => sum + d.ms, 0);
  return (
    <section id="detail" aria-labelledby="detail-h" className={`${panel} grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={pokemon.gen4Sprite ?? pokemon.sprite ?? spriteUrl(id)} alt={pokemon.displayName} width={160} height={160} className="justify-self-center [image-rendering:pixelated]" />
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="detail-h" className="neon-text text-xl font-bold uppercase tracking-[0.06em]" style={display}>
            #{String(id).padStart(3, "0")} {pokemon.displayName}
          </h2>
          <Link href={closeHref} className={`text-sm text-(--dk-diamond) underline underline-offset-2 ${focusRing}`}>
            Close
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pokemon.types.map((t) => (
            <TypeTag key={t} type={t} />
          ))}
          <span className="text-sm text-(--dk-muted)">{pokemon.genus}</span>
        </div>
        <p className="text-sm">{pokemon.flavorText}</p>
        <div className="border-t-2 border-(--dk-line) pt-2">
          {days.length === 0 ? (
            <p className="text-sm text-(--dk-muted)">{pokemon.displayName} hasn&apos;t coached you yet. Every Pokémon gets a turn within 151 days.</p>
          ) : (
            <>
              <p className="text-sm font-bold" style={display}>
                Coached you {days.length} {days.length === 1 ? "day" : "days"} · {formatDuration(total)} together
              </p>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--dk-muted)" style={mono}>
                {days.map((d) => (
                  <li key={d.date}>
                    {formatDay(d.date)} · {formatDuration(d.ms)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PokedexSkeleton() {
  return (
    <div role="status" aria-label="Loading the Pokédex" className="mt-5 flex flex-col gap-5">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}
