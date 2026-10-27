import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

// Supabase client for Server Components, Server Actions and Route Handlers.
// Every request carries the signed-in user's Clerk session token, so RLS sees
// their Clerk ID as auth.jwt() ->> 'sub'. Signed out, there is no token and the
// request runs as `anon`, which has no access to any table.
export async function createServerSupabase() {
  const { url, publishableKey } = supabaseEnv();
  const { getToken } = await auth();
  return createClient<Database>(url, publishableKey, {
    accessToken: async () => (await getToken()) ?? null,
  });
}
