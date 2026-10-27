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
        <ClerkProvider>
          <TimeZoneCookie />
          <header className="border-b-2 border-(--dk-edge) bg-(--dk-panel)">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
              <Link
                href="/"
                className={`flex items-center gap-2 whitespace-nowrap rounded-(--dk-r-sm) text-xs font-bold uppercase tracking-[0.08em] sm:text-sm ${focusRing}`}
                style={{ fontFamily: "var(--dp-display)" }}
              >
                <span aria-hidden className="inline-block size-3 rounded-full border-2 border-[#05070d] bg-(--dk-red)" />
                Trainer Timesheet
              </Link>
              <Suspense fallback={<div className="h-9 w-40" aria-hidden />}>
                <AuthControls />
              </Suspense>
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t-2 border-(--dk-edge) bg-(--dk-panel) px-4 py-3 text-center text-xs text-(--dk-muted)">
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

const navLink = `rounded-(--dk-r-sm) px-2 py-1 text-sm text-(--dk-diamond) hover:text-(--dk-ice) ${focusRing}`;

// Reads the signed-in state per request, so it streams in behind Suspense.
function AuthControls() {
  return (
    <nav aria-label="Main" className="flex items-center gap-2" style={{ fontFamily: "var(--dp-mono)" }}>
      <Show when="signed-out">
        <SignInButton>
          <Button variant="ghost" size="sm">Sign in</Button>
        </SignInButton>
        <SignUpButton>
          <Button size="sm">Sign up</Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className={navLink}>
          Dashboard
        </Link>
        <UserButton />
      </Show>
    </nav>
  );
}
