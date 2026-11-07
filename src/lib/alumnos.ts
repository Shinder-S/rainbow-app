/** Tipos, formato y validación de la zona Alumnos.
 *
 * Los topes de largo copian los CHECK de las migraciones: si la base
 * rechaza algo, que el formulario lo haya frenado antes y en castellano. */

export type Grupo = {
  id: string;
  nombre: string;
  nivel: string | null;
  horario: string | null;
  notas: string | null;
  activo: boolean;
};

export type Alumno = {
  id: string;
  nombre: string;
  nivel: string | null;
  grupo_id: string | null;
  modalidad: "grupal" | "individual";
  /** Sólo para individuales; los grupales usan el horario del grupo. */
  horario: string | null;
  es_menor: boolean;
  objetivo: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_email: string | null;
  cuota_mensual: number | null;
  notas: string | null;
  activo: boolean;
};

export type Avance = {
  id: string;
  alumno_id: string;
  fecha: string;
  nota: string;
};

export const TOPES = {
  nombre: 120,
  nivel: 40,
  horario: 120,
  objetivo: 200,
  contacto_nombre: 120,
  contacto_telefono: 30,
  contacto_email: 254,
  notas: 4000,
  nota_avance: 2000,
  grupo_nombre: 60,
  grupo_horario: 120,
  grupo_notas: 1000,
} as const;

/** Columnas que se piden de alumnos (nunca `*`: si mañana se suma una columna
 * sensible, no viaja sola). */
export const COLUMNAS_ALUMNO =
  "id, nombre, nivel, grupo_id, modalidad, horario, es_menor, objetivo, contacto_nombre, contacto_telefono, contacto_email, cuota_mensual, notas, activo";
export const COLUMNAS_GRUPO = "id, nombre, nivel, horario, notas, activo";

/** El horario que corresponde mostrar: el propio si es individual, el del
 * grupo si es grupal. */
export function horarioDe(alumno: Pick<Alumno, "modalidad" | "horario">, grupo: Grupo | null | undefined): string | null {
  return alumno.modalidad === "individual" ? alumno.horario : (grupo?.horario ?? null);
}

/** Texto vacío → null, para no guardar "" en la base. */
export function textoONull(v: string): string | null {
  const t = v.trim();
  return t === "" ? null : t;
}

const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export function formatoPesos(n: number | null): string {
  return n == null ? "—" : pesos.format(n);
}

/** "2026-11-07" → "07/11/2026" sin pasar por Date (evita el corrimiento de
 * zona horaria que convierte el 7 en el 6). */
export function formatoFecha(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

/** Fecha de hoy en Argentina, como "AAAA-MM-DD". */
export function hoyAR(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

/** Link de WhatsApp a partir de un teléfono cargado a mano. Asume Argentina si
 * no trae código de país; devuelve null si no hay suficientes dígitos. */
export function linkWhatsApp(telefono: string | null): string | null {
  if (!telefono) return null;
  let d = telefono.replace(/\D/g, "");
  if (d.length < 8) return null;
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("54")) d = `549${d}`;
  return `https://wa.me/${d}`;
}

/** Para buscar sin que importen tildes ni mayúsculas. */
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Errores de Postgres/PostgREST en castellano para Graciela. */
export function mensajeError(e: { message?: string; code?: string } | null): string {
  if (!e) return "";
  if (e.code === "23514") return "Algún dato es demasiado largo o no es válido.";
  if (e.code === "42501") return "No tenés permiso para hacer esto. Probá salir y volver a entrar.";
  if (/fetch|network/i.test(e.message ?? "")) return "No hay conexión. Probá de nuevo en un rato.";
  return "No se pudo guardar. Probá de nuevo.";
}
