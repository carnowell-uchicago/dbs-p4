import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* SignIn reads the URL on the client, so it streams in behind Suspense. */}
      <Suspense fallback={<p className="text-sm opacity-60">Loading…</p>}>
        <SignIn />
      </Suspense>
    </div>
  );
}
