import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Proxy (ex `middleware.ts`, renombrado en Next 16). Mismo patrón que
 * On The Rocks:
 *
 *   1. Cierra /so del lado del servidor: sin sesión de admin no se sirve ni
 *      la cáscara del panel. Es defensa en profundidad; la protección real es
 *      la RLS.
 *   2. Pone `noindex` en todo lo privado. Acá hay datos de menores.
 *
 * Cómo falla:
 *   · sin sesión            → a /ingresar (falla cerrado)
 *   · rol distinto de admin → a /ingresar
 *   · error leyendo el rol  → deja pasar y lo registra (falla abierto a
 *     propósito: la única usuaria es Graciela, y dejarla afuera de su propio
 *     SO por un error de red es peor; abajo sigue la RLS). */

const SOLO_ADMIN = /^\/so(\/|$)/;
const NOINDEX = "noindex, nofollow, noarchive";

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });
  res.headers.set("X-Robots-Tag", NOINDEX);

  if (!SOLO_ADMIN.test(req.nextUrl.pathname)) return res;

  const alIngreso = () => {
    const url = req.nextUrl.clone();
    url.pathname = "/ingresar";
    url.search = "";
    const r = NextResponse.redirect(url);
    r.headers.set("X-Robots-Tag", NOINDEX);
    return r;
  };

  // Sin Supabase configurado no hay sesión posible.
  if (!env.supabaseUrl || !env.supabaseAnonKey) return alIngreso();

  const sb = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookies) => {
        // Token renovado: va a la request (para este render) y a la response
        // (para el navegador).
        for (const { name, value } of cookies) req.cookies.set(name, value);
        res = NextResponse.next({ request: { headers: req.headers } });
        res.headers.set("X-Robots-Tag", NOINDEX);
        for (const { name, value, options } of cookies) res.cookies.set(name, value, options);
      },
    },
  });

  // getUser() valida el JWT contra Auth; getSession() confiaría en la cookie.
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return alIngreso();

  const { data: perfil, error: errPerfil } = await sb
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (errPerfil) {
    console.error("[proxy] no pude leer el rol, dejo pasar:", errPerfil.message);
    return res;
  }
  if (perfil?.role !== "admin") return alIngreso();

  return res;
}

export const config = {
  matcher: ["/so", "/so/:path*", "/ingresar"],
};
