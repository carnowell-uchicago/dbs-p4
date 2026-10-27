// The two public Supabase settings. Both are safe in the browser: the publishable
// key only lets requests in; RLS decides what each signed-in user can touch.
// Written out in full so Next.js can inline them into the browser bundle.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function supabaseEnv() {
  // Name the missing variable, never print a value.
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  if (!publishableKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
  return { url, publishableKey };
}
