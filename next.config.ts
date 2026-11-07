import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/** Content-Security-Policy armada desde lo que la app carga de verdad, igual
 *  que en On The Rocks.
 *
 *  connect-src  sólo Supabase. Claude se llama DESDE EL SERVIDOR: si alguna vez
 *               hiciera falta abrirle un dominio acá, sería señal de que la
 *               key se filtró al cliente.
 *  script-src   en desarrollo suma 'unsafe-eval', que lo pide el HMR de
 *               `next dev`. En On The Rocks la CSP sin eso dejaba el dev sin
 *               hidratar y había que probar con build + start. En producción
 *               no va. */
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_WS = SUPABASE.replace("https://", "wss://");
const DEV = process.env.NODE_ENV === "development";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  `connect-src 'self' ${SUPABASE} ${SUPABASE_WS}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: dir,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // La cámara se va a necesitar para sacarle foto a un writing: se
          // habilita sólo para este sitio. El resto, apagado.
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
