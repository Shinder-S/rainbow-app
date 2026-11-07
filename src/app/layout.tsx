import type { Metadata, Viewport } from "next";
import { Comic_Neue } from "next/font/google";
import "../styles.css";

// Respaldo de Comic Sans para Android/iOS, que no la traen (ver --f-comic en styles.css).
const comicNeue = Comic_Neue({ subsets: ["latin"], variable: "--f-comic-neue", weight: ["400", "700"] });

export const metadata: Metadata = {
  // Base para las URLs absolutas de la imagen al compartir. En Vercel se
  // completa NEXT_PUBLIC_SITE_URL con el dominio real.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"),
  title: "Rainbow · Instituto de inglés",
  description: "Sistema operativo de Rainbow, instituto de inglés en Tandil.",
  // Todo lo de hoy es privado (el panel de Graciela). La landing pública,
  // cuando exista, se indexa por su cuenta.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff8ec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={comicNeue.variable}>
      <body>{children}</body>
    </html>
  );
}
