// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

// ✅ Accept cookies object from caller
export const createServerClientWithCookies = (
  cookieStore: ReadonlyRequestCookies,
) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value,
        set: async () => {},
        remove: async () => {},
      },
    },
  );
};
