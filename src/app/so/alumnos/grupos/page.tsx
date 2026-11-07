"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { COLUMNAS_GRUPO, TOPES, mensajeError, textoONull, type Grupo } from "@/lib/alumnos";

/** Grupos y horarios. Viven dentro de Alumnos (decisión del documento: no es
 * una zona aparte). Un grupo no se borra: se desactiva, para que los alumnos
 * que estuvieron en él sigan teniendo historia. */
export default function Grupos() {
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);
  const [cantidad, setCantidad] = useState<Map<string, number>>(new Map());
  const [editando, setEditando] = useState<string | null>(null); // id, "nuevo" o null
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    Promise.all([
      sb.from("grupos").select(COLUMNAS_GRUPO).order("nombre"),
      sb.from("alumnos").select("grupo_id").eq("activo", true).not("grupo_id", "is", null),
    ]).then(([g, a]) => {
      if (g.error) setError("No se pudieron cargar los grupos.");
      setGrupos((g.data as Grupo[]) ?? []);
      const m = new Map<string, number>();
      for (const { grupo_id } of (a.data as { grupo_id: string }[]) ?? []) m.set(grupo_id, (m.get(grupo_id) ?? 0) + 1);
      setCantidad(m);
    });
  }, []);

  function guardado(g: Grupo) {
    setGrupos((prev) => {
      const sin = (prev ?? []).filter((x) => x.id !== g.id);
      return [...sin, g].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    });
    setEditando(null);
  }

  const activos = grupos?.filter((g) => g.activo) ?? [];
  const inactivos = grupos?.filter((g) => !g.activo) ?? [];

  return (
    <section className="zona-pagina" style={{ "--zona": "var(--c-naranja)" } as React.CSSProperties}>
      <Link href="/so/alumnos" className="enlace volver">
        ← Alumnos
      </Link>
      <div className="zona-titulo">
        <div>
          <h1>Grupos y horarios</h1>
          <p className="zona-resumen">Hasta 8 alumnos por grupo.</p>
        </div>
        {editando !== "nuevo" && (
          <button type="button" className="boton boton-zona" onClick={() => setEditando("nuevo")}>
            + Nuevo
          </button>
        )}
      </div>

      {error && (
        <p className="aviso aviso-alerta" role="alert">
          {error}
        </p>
      )}

      {editando === "nuevo" && <GrupoForm onGuardado={guardado} onCancelar={() => setEditando(null)} />}

      {grupos !== null && grupos.length === 0 && editando !== "nuevo" && (
        <div className="vacio">
          <p>Todavía no hay grupos.</p>
        </div>
      )}

      <ul className="lista">
        {[...activos, ...inactivos].map((g) =>
          editando === g.id ? (
            <li key={g.id}>
              <GrupoForm inicial={g} onGuardado={guardado} onCancelar={() => setEditando(null)} />
            </li>
          ) : (
            <li key={g.id}>
              <button type="button" className="fila" onClick={() => setEditando(g.id)}>
                <span className="fila-titulo">
                  {g.nombre}
                  {!g.activo && <span className="chip">Inactivo</span>}
                </span>
                <span className="fila-detalle">
                  {[g.nivel, g.horario, `${cantidad.get(g.id) ?? 0} de 8`].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function GrupoForm({
  inicial,
  onGuardado,
  onCancelar,
}: {
  inicial?: Grupo;
  onGuardado: (g: Grupo) => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [nivel, setNivel] = useState(inicial?.nivel ?? "");
  const [horario, setHorario] = useState(inicial?.horario ?? "");
  const [notas, setNotas] = useState(inicial?.notas ?? "");
  const [activo, setActivo] = useState(inicial?.activo ?? true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setGuardando(true);
    setError("");
    const datos = {
      nombre: nombre.trim(),
      nivel: textoONull(nivel),
      horario: textoONull(horario),
      notas: textoONull(notas),
      activo,
    };
    const q = inicial
      ? sb.from("grupos").update(datos).eq("id", inicial.id)
      : sb.from("grupos").insert(datos);
    const { data, error: err } = await q.select(COLUMNAS_GRUPO).single();
    setGuardando(false);
    if (err) setError(mensajeError(err));
    else onGuardado(data as Grupo);
  }

  return (
    <form onSubmit={enviar} className="formulario tarjeta-form">
      <label>
        Nombre del grupo
        <input
          required
          maxLength={TOPES.grupo_nombre}
          placeholder="Ej.: Kids martes y jueves"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>
      <div className="dos-columnas">
        <label>
          Nivel
          <input maxLength={TOPES.nivel} value={nivel} onChange={(e) => setNivel(e.target.value)} />
        </label>
        <label>
          Horario
          <input
            maxLength={TOPES.grupo_horario}
            placeholder="Ej.: mar y jue 18:00"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
        </label>
      </div>
      <label>
        Notas
        <textarea rows={2} maxLength={TOPES.grupo_notas} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </label>
      {inicial && (
        <label className="casilla">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          Grupo activo
        </label>
      )}
      {error && (
        <p className="aviso aviso-alerta" role="alert">
          {error}
        </p>
      )}
      <div className="botonera">
        <button type="submit" className="boton boton-zona" disabled={guardando}>
          {guardando ? "Guardando…" : inicial ? "Guardar" : "Crear grupo"}
        </button>
        <button type="button" className="boton-texto" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
