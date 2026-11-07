"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Arcoiris } from "./Arcoiris";
import { ZONAS } from "@/lib/zonas";
import { getSupabase } from "@/lib/supabase";

/** Cáscara del SO: cabecera, menú de zonas y salir.
 *
 * El menú es una tira horizontal que se desliza en el celular, no un
 * hamburguesa: es la lección del menú del SO de On The Rocks (21/09), donde
 * el desplegable tapaba media pantalla. */
export function SoShell({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const router = useRouter();

  async function salir() {
    await getSupabase()?.auth.signOut();
    router.replace("/ingresar");
    router.refresh();
  }

  return (
    <div className="so">
      <header className="so-cabecera">
        <Link href="/so" className="so-marca">
          <Arcoiris tamano={36} />
          <span>Rainbow</span>
        </Link>
        <button type="button" className="boton-texto" onClick={salir}>
          Salir
        </button>
      </header>

      <nav className="so-menu" aria-label="Zonas del sistema">
        <Link href="/so" className={ruta === "/so" ? "activo" : undefined}>
          Inicio
        </Link>
        {ZONAS.map((z) => (
          <Link
            key={z.ruta}
            href={z.ruta}
            className={ruta.startsWith(z.ruta) ? "activo" : undefined}
            style={{ "--zona": z.color } as React.CSSProperties}
          >
            {z.nombre}
          </Link>
        ))}
      </nav>

      <main className="so-contenido">{children}</main>
    </div>
  );
}
