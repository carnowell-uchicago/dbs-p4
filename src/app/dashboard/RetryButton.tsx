"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ds/Button";

// Re-renders the page on the server, which asks PokéAPI again.
export function RetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button size="sm" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      {pending ? "Trying…" : "Try again"}
    </Button>
  );
}
