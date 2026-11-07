import Link from "next/link";
import { ZONAS } from "@/lib/zonas";

export default function SoInicio() {
  return (
    <>
      <section className="saludo">
        <h1>Hola, Graciela</h1>
        <p>Todo lo del instituto, en un solo lugar.</p>
      </section>

      <ul className="zonas">
        {ZONAS.map((z) => (
          <li key={z.ruta}>
            <Link href={z.ruta} className="zona-tarjeta" style={{ "--zona": z.color } as React.CSSProperties}>
              <h2>{z.nombre}</h2>
              <p>{z.resumen}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
