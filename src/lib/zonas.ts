/** Las 5 zonas del mínimo de la Semana 6 (Documento del SO, sección 4).
 *
 * Fuente única para el menú del SO y para las tarjetas del inicio: si se suma
 * una zona, se suma acá y aparece en los dos lugares. La regla del cohort
 * sigue valiendo: hasta 6, y si hay duda, va al backlog. */
export type Zona = {
  ruta: string;
  nombre: string;
  /** Para qué sirve, en palabras de Graciela. */
  resumen: string;
  color: string;
};

export const ZONAS: readonly Zona[] = [
  {
    ruta: "/so/alumnos",
    nombre: "Alumnos",
    resumen: "La ficha de cada alumno: nivel, grupo, horario, familia y cómo viene avanzando.",
    color: "var(--c-naranja)",
  },
  {
    ruta: "/so/correcciones",
    nombre: "Correcciones",
    resumen: "Cargás el writing y la IA te propone una devolución para ese alumno, que vos ajustás.",
    color: "var(--c-verde)",
  },
  {
    ruta: "/so/clases",
    nombre: "Clases",
    resumen: "Un borrador de clase, actividades o fotocopia según el nivel, el tema y el libro.",
    color: "var(--c-violeta)",
  },
  {
    ruta: "/so/cuotas",
    nombre: "Cuotas",
    resumen: "Quién pagó y quién debe en el mes. Reemplaza el cuaderno.",
    color: "var(--c-verde)",
  },
  {
    ruta: "/so/avisos",
    nombre: "Avisos",
    resumen: "Escribís el aviso una vez y queda listo para pegar en WhatsApp.",
    color: "var(--c-naranja)",
  },
];
