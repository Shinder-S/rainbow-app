import { ZONAS } from "@/lib/zonas";

/** Página provisoria de cada zona mientras se construye. Lee nombre, color y
 * resumen de `ZONAS`, así no se repiten en cada página. */
export function ZonaEnConstruccion({ ruta, proximo }: { ruta: string; proximo: string[] }) {
  const zona = ZONAS.find((z) => z.ruta === ruta);
  if (!zona) return null;
  return (
    <section className="zona-pagina" style={{ "--zona": zona.color } as React.CSSProperties}>
      <h1>{zona.nombre}</h1>
      <p className="zona-resumen">{zona.resumen}</p>
      <div className="en-construccion">
        <p className="etiqueta">En construcción</p>
        <ul>
          {proximo.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
