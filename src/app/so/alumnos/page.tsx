"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { COLUMNAS_ALUMNO, COLUMNAS_GRUPO, normalizar, type Alumno, type Grupo } from "@/lib/alumnos";

/** Lista de alumnos: buscador, filtro por grupo y acceso a cada ficha. */
export default function Alumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[] | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [grupo, setGrupo] = useState("todos");
  const [verInactivos, setVerInactivos] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    Promise.all([
      sb.from("alumnos").select(COLUMNAS_ALUMNO).order("nombre"),
      sb.from("grupos").select(COLUMNAS_GRUPO).order("nombre"),
    ]).then(([a, g]) => {
      if (a.error || g.error) {
        setError("No se pudieron cargar los alumnos. Probá recargar la página.");
        setAlumnos([]);
        return;
      }
      setAlumnos(a.data as Alumno[]);
      setGrupos(g.data as Grupo[]);
    });
  }, []);

  const grupoPorId = useMemo(() => new Map(grupos.map((g) => [g.id, g])), [grupos]);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return (alumnos ?? []).filter((a) => {
      if (a.activo === verInactivos) return false;
      if (grupo === "sin" && a.grupo_id) return false;
      if (grupo !== "todos" && grupo !== "sin" && a.grupo_id !== grupo) return false;
      if (!q) return true;
      return [a.nombre, a.contacto_nombre, a.nivel].some((t) => t && normalizar(t).includes(q));
    });
  }, [alumnos, busqueda, grupo, verInactivos]);

  const activos = alumnos?.filter((a) => a.activo).length ?? 0;

  return (
    <section className="zona-pagina" style={{ "--zona": "var(--c-naranja)" } as React.CSSProperties}>
      <div className="zona-titulo">
        <div>
          <h1>Alumnos</h1>
          <p className="zona-resumen">
            {alumnos === null ? "Cargando…" : `${activos} ${activos === 1 ? "alumno activo" : "alumnos activos"}`}
          </p>
        </div>
        <Link href="/so/alumnos/nuevo" className="boton boton-zona">
          + Nuevo
        </Link>
      </div>

      <div className="filtros">
        <input
          type="search"
          className="campo"
          placeholder="Buscar por nombre, familia o nivel"
          aria-label="Buscar alumno"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select className="campo" aria-label="Filtrar por grupo" value={grupo} onChange={(e) => setGrupo(e.target.value)}>
          <option value="todos">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
          <option value="sin">Sin grupo (individuales)</option>
        </select>
      </div>

      <div className="acciones-linea">
        <Link href="/so/alumnos/grupos" className="enlace">
          Grupos y horarios →
        </Link>
        <label className="casilla">
          <input type="checkbox" checked={verInactivos} onChange={(e) => setVerInactivos(e.target.checked)} />
          Ver los que dejaron
        </label>
      </div>

      {error && (
        <p className="aviso aviso-alerta" role="alert">
          {error}
        </p>
      )}

      {alumnos !== null && visibles.length === 0 && !error && (
        <div className="vacio">
          {alumnos.length === 0 ? (
            <>
              <p>Todavía no cargaste ningún alumno.</p>
              <Link href="/so/alumnos/nuevo" className="boton boton-zona">
                Cargar el primero
              </Link>
            </>
          ) : (
            <p>No hay alumnos que coincidan.</p>
          )}
        </div>
      )}

      <ul className="lista">
        {visibles.map((a) => {
          const g = a.grupo_id ? grupoPorId.get(a.grupo_id) : null;
          return (
            <li key={a.id}>
              <Link href={`/so/alumnos/${a.id}`} className="fila">
                <span className="fila-titulo">{a.nombre}</span>
                <span className="fila-detalle">
                  {[a.nivel, g ? g.nombre : a.modalidad === "individual" ? "Individual" : "Sin grupo", g?.horario]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
