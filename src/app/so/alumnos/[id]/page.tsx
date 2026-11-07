"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlumnoForm, type DatosAlumno } from "@/components/AlumnoForm";
import { getSupabase } from "@/lib/supabase";
import {
  COLUMNAS_ALUMNO,
  COLUMNAS_GRUPO,
  TOPES,
  formatoFecha,
  formatoPesos,
  horarioDe,
  hoyAR,
  linkWhatsApp,
  mensajeError,
  type Alumno,
  type Avance,
  type Grupo,
} from "@/lib/alumnos";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ficha del alumno: todo lo suyo en un solo lugar (lo que Graciela pidió en
 * la sección 2.5 del documento). Datos, contacto y notas de avance. */
export default function FichaAlumno() {
  const { id } = useParams<{ id: string }>();
  const [alumno, setAlumno] = useState<Alumno | null | undefined>(undefined);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [avances, setAvances] = useState<Avance[]>([]);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !UUID.test(id)) {
      setAlumno(null);
      return;
    }
    const [a, g, av] = await Promise.all([
      sb.from("alumnos").select(COLUMNAS_ALUMNO).eq("id", id).maybeSingle(),
      sb.from("grupos").select(COLUMNAS_GRUPO).order("nombre"),
      sb
        .from("avances")
        .select("id, alumno_id, fecha, nota")
        .eq("alumno_id", id)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);
    if (a.error) setError("No se pudo cargar la ficha. Probá recargar la página.");
    setAlumno((a.data as Alumno | null) ?? null);
    setGrupos((g.data as Grupo[]) ?? []);
    setAvances((av.data as Avance[]) ?? []);
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardar(datos: DatosAlumno): Promise<string | null> {
    const sb = getSupabase();
    if (!sb) return "Falta conectar la base de datos.";
    const { data, error: err } = await sb.from("alumnos").update(datos).eq("id", id).select(COLUMNAS_ALUMNO).single();
    if (err) return mensajeError(err);
    setAlumno(data as Alumno);
    setEditando(false);
    return null;
  }

  async function cambiarActivo() {
    if (!alumno) return;
    const pregunta = alumno.activo
      ? `¿Marcar que ${alumno.nombre} dejó? No se borra nada: su historial queda guardado y se puede reactivar.`
      : `¿Reactivar a ${alumno.nombre}?`;
    if (!window.confirm(pregunta)) return;
    const { data, error: err } = await getSupabase()!
      .from("alumnos")
      .update({ activo: !alumno.activo })
      .eq("id", id)
      .select(COLUMNAS_ALUMNO)
      .single();
    if (err) setError(mensajeError(err));
    else setAlumno(data as Alumno);
  }

  const estilo = { "--zona": "var(--c-naranja)" } as React.CSSProperties;

  if (alumno === undefined) {
    return (
      <section className="zona-pagina" style={estilo}>
        <p className="zona-resumen">Cargando…</p>
      </section>
    );
  }

  if (alumno === null) {
    return (
      <section className="zona-pagina" style={estilo}>
        <Link href="/so/alumnos" className="enlace volver">
          ← Alumnos
        </Link>
        <h1>No encontré a este alumno</h1>
        {error && <p className="aviso aviso-alerta">{error}</p>}
      </section>
    );
  }

  const grupo = alumno.grupo_id ? grupos.find((g) => g.id === alumno.grupo_id) : null;
  const horario = horarioDe(alumno, grupo);
  const wa = linkWhatsApp(alumno.contacto_telefono);

  return (
    <section className="zona-pagina" style={estilo}>
      <Link href="/so/alumnos" className="enlace volver">
        ← Alumnos
      </Link>

      <div className="zona-titulo">
        <div>
          <h1>{alumno.nombre}</h1>
          <p className="zona-resumen">
            {[alumno.nivel, alumno.modalidad === "individual" ? "Individual" : grupo?.nombre ?? "Sin grupo"]
              .filter(Boolean)
              .join(" · ")}
            {!alumno.activo && <span className="chip">Dejó</span>}
          </p>
        </div>
        {!editando && (
          <button type="button" className="boton boton-secundario" onClick={() => setEditando(true)}>
            Editar
          </button>
        )}
      </div>

      {error && (
        <p className="aviso aviso-alerta" role="alert">
          {error}
        </p>
      )}

      {editando ? (
        <AlumnoForm
          inicial={alumno}
          grupos={grupos}
          textoBoton="Guardar cambios"
          onGuardar={guardar}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          <dl className="ficha">
            {horario && (
              <div>
                <dt>Horario</dt>
                <dd>{horario}</dd>
              </div>
            )}
            {alumno.objetivo && (
              <div>
                <dt>Objetivo</dt>
                <dd>{alumno.objetivo}</dd>
              </div>
            )}
            <div>
              <dt>Cuota mensual</dt>
              <dd>{formatoPesos(alumno.cuota_mensual)}</dd>
            </div>
            <div>
              <dt>{alumno.es_menor ? "Familia" : "Contacto"}</dt>
              <dd>
                {alumno.contacto_nombre && <span className="bloque">{alumno.contacto_nombre}</span>}
                {alumno.contacto_telefono &&
                  (wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="bloque">
                      WhatsApp: {alumno.contacto_telefono}
                    </a>
                  ) : (
                    <span className="bloque">{alumno.contacto_telefono}</span>
                  ))}
                {alumno.contacto_email && (
                  <a href={`mailto:${alumno.contacto_email}`} className="bloque">
                    {alumno.contacto_email}
                  </a>
                )}
                {!alumno.contacto_nombre && !alumno.contacto_telefono && !alumno.contacto_email && "Sin cargar"}
              </dd>
            </div>
            {alumno.notas && (
              <div>
                <dt>Notas</dt>
                <dd className="texto-largo">{alumno.notas}</dd>
              </div>
            )}
          </dl>

          <Avances alumnoId={alumno.id} avances={avances} onCambio={setAvances} />

          <button type="button" className="boton-texto peligro" onClick={cambiarActivo}>
            {alumno.activo ? "Marcar que dejó" : "Reactivar alumno"}
          </button>
        </>
      )}
    </section>
  );
}

/** Notas de avance con fecha: lo que hoy vive en el cuaderno. Una entrada por
 * nota, la más nueva arriba. */
function Avances({
  alumnoId,
  avances,
  onCambio,
}: {
  alumnoId: string;
  avances: Avance[];
  onCambio: (a: Avance[]) => void;
}) {
  const [nota, setNota] = useState("");
  const [fecha, setFecha] = useState(hoyAR());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function agregar(e: FormEvent) {
    e.preventDefault();
    const texto = nota.trim();
    if (!texto) return;
    setGuardando(true);
    setError("");
    const { data, error: err } = await getSupabase()!
      .from("avances")
      .insert({ alumno_id: alumnoId, nota: texto, fecha })
      .select("id, alumno_id, fecha, nota")
      .single();
    setGuardando(false);
    if (err) {
      setError(mensajeError(err));
      return;
    }
    onCambio([data as Avance, ...avances].sort((a, b) => b.fecha.localeCompare(a.fecha)));
    setNota("");
    setFecha(hoyAR());
  }

  async function borrar(a: Avance) {
    if (!window.confirm("¿Borrar esta nota de avance? No se puede deshacer.")) return;
    const { error: err } = await getSupabase()!.from("avances").delete().eq("id", a.id);
    if (err) setError(mensajeError(err));
    else onCambio(avances.filter((x) => x.id !== a.id));
  }

  return (
    <div className="bloque-seccion">
      <h2>Cómo viene</h2>
      <form onSubmit={agregar} className="formulario">
        <label>
          Nueva nota
          <textarea
            rows={3}
            maxLength={TOPES.nota_avance}
            placeholder="Ej.: mejoró mucho el listening; repasar past simple"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </label>
        <div className="botonera">
          <input
            type="date"
            className="campo campo-fecha"
            aria-label="Fecha de la nota"
            value={fecha}
            max={hoyAR()}
            onChange={(e) => setFecha(e.target.value)}
          />
          <button type="submit" className="boton boton-zona" disabled={guardando || !nota.trim()}>
            {guardando ? "Guardando…" : "Agregar nota"}
          </button>
        </div>
        {error && (
          <p className="aviso aviso-alerta" role="alert">
            {error}
          </p>
        )}
      </form>

      {avances.length === 0 ? (
        <p className="zona-resumen">Todavía no hay notas.</p>
      ) : (
        <ul className="avances">
          {avances.map((a) => (
            <li key={a.id}>
              <div className="avance-cabecera">
                <span className="avance-fecha">{formatoFecha(a.fecha)}</span>
                <button type="button" className="boton-texto chico" onClick={() => borrar(a)}>
                  Borrar
                </button>
              </div>
              <p className="texto-largo">{a.nota}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
