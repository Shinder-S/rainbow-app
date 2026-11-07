import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

/** Cliente de Supabase del navegador.
 *
 * Nace con `@supabase/ssr` y no con `createClient` de supabase-js: la sesión
 * vive en COOKIES, no en localStorage. Es lo que On The Rocks tuvo que migrar
 * después (hallazgo M-6 de su auditoría): sin cookies, `src/proxy.ts` no puede
 * ver la sesión y no hay forma de cerrar /so del lado del servidor.
 *
 * La protección real sigue siendo la RLS de Postgres; el proxy es defensa en
 * profundidad. */

export function supabaseConfigurado(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey && !env.supabaseUrl.includes("TU-PROYECTO"));
}

let cliente: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigurado()) return null;
  cliente ??= createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return cliente;
}
