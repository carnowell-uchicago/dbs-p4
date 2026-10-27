import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ds/Button";
import { focusRing } from "@/components/ds/classes";
import { fontVars } from "@/components/ds/fonts";
import { grassBackground } from "@/components/ds/textures";
import { paletteVars } from "@/components/ds/tokens";
import { TimeZoneCookie } from "@/components/TimeZoneCookie";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trainer Timesheet",
  description: "Log your work hours, earn trainer XP, and get coached by a new Pokémon every day.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVars} h-full antialiased [color-scheme:dark]`}>
      <body
        className="flex min-h-full flex-col bg-(--dk-void) text-(--dk-ice) selection:bg-(--dk-sky) selection:text-(--dk-void)"
        style={{ ...paletteVars, ...grassBackground, fontFamily: "var(--dp-body)" }}
      >
        <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
          <TimeZoneCookie />
          <header className="border-b-2 border-(--dk-edge) bg-(--dk-panel) shadow-[0_2px_16px_color-mix(in_srgb,var(--dk-sky)_28%,transparent)] print:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
              <Link
                href="/"
                className={`neon-text flex items-center gap-2 whitespace-nowrap rounded-(--dk-r-sm) text-xs font-bold uppercase tracking-[0.08em] sm:text-sm ${focusRing}`}
                style={{ fontFamily: "var(--dp-display)" }}
              >
                <span aria-hidden className="inline-block size-3 rounded-full border-2 border-[#05070d] bg-(--dk-red) shadow-[0_0_8px_var(--dk-red)]" />
                Trainer Timesheet
              </Link>
              <Suspense fallback={<div className="h-9 w-40 max-w-full" aria-hidden />}>
                <AuthControls />
              </Suspense>
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t-2 border-(--dk-edge) bg-(--dk-panel) px-4 py-3 text-center text-xs text-(--dk-muted) print:hidden">
            Pokémon data from{" "}
            <a href="https://pokeapi.co" className={`text-(--dk-diamond) underline underline-offset-2 ${focusRing}`}>
              PokéAPI
            </a>
            . Pokémon and Pokémon character names are trademarks of Nintendo. Fan project, not affiliated.
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}

const navLink = `whitespace-nowrap rounded-(--dk-r-sm) px-1.5 py-1 text-xs text-(--dk-diamond) hover:text-(--dk-ice) sm:px-2 sm:text-sm ${focusRing}`;

// Reads the signed-in state per request, so it streams in behind Suspense.
function AuthControls() {
  return (
    <nav aria-label="Main" className="flex items-center gap-2 max-sm:has-[a]:w-full" style={{ fontFamily: "var(--dp-mono)" }}>
      <Show when="signed-out">
        <SignInButton>
          <Button variant="ghost" size="sm">Sign in</Button>
        </SignInButton>
        <SignUpButton>
          <Button size="sm">Sign up</Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        {/* On phones this row takes the full width under the brand, so nothing spills sideways. */}
        <div className="flex w-full items-center justify-between gap-1 sm:w-auto sm:gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link href="/dashboard" className={navLink}>
              Dashboard
            </Link>
            <Link href="/pokedex" className={navLink}>
              Pokédex
            </Link>
            <Link href="/log" className={navLink}>
              Timesheet
            </Link>
            <Link href="/profile" className={navLink}>
              Trainer
            </Link>
          </div>
          <UserButton />
        </div>
      </Show>
    </nav>
  );
}
