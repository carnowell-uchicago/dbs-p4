"use client";

// Tells the server which time zone this browser is in, so "today" means the
// user's today. A zone saved in the profile overrides this (see lib/data.ts).
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TimeZoneCookie() {
  const router = useRouter();
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie.match(/(?:^|; )tz=([^;]*)/)?.[1];
    if (zone && decodeURIComponent(current ?? "") !== zone) {
      document.cookie = `tz=${encodeURIComponent(zone)}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
  }, [router]);
  return null;
}
