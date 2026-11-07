"use client";

import { useState, type FormEvent } from "react";
import { TOPES, textoONull, type Alumno, type Grupo } from "@/lib/alumnos";

export type DatosAlumno = Omit<Alumno, "id" | "activo">;

const VACIO: DatosAlumno = {
  nombre: "",
  nivel: null,
  grupo_id: null,
  modalidad: "grupal",
  horario: null,
  es_menor: true,
  objetivo: null,
  contacto_nombre: null,
  contacto_telefono: null,
  contacto_email: null,
  cuota_mensual: null,
  notas: null,
};

/** Formulario de alta y edición. No guarda: le pasa los datos limpios a
 * `onGuardar`, que decide si es insert o update. */
export function AlumnoForm({
  inicial,
  grupos,
  textoBoton,
  onGuardar,
  onCancelar,
}: {
  inicial?: Alumno;
  grupos: Grupo[];
  textoBoton: string;
  onGuardar: (datos: DatosAlumno) => Promise<string | null>;
  onCancelar: () => void;
}) {
  const base = inicial ?? VACIO;
  const [nombre, setNombre] = useState(base.nombre);
  const [nivel, setNivel] = useState(base.nivel ?? "");
  const [grupoId, setGrupoId] = useState(base.grupo_id ?? "");
  const [modalidad, setModalidad] = useState(base.modalidad);
  const [horario, setHorario] = useState(base.horario ?? "");
  const [esMenor, setEsMenor] = useState(base.es_menor);
  const [objetivo, setObjetivo] = useState(base.objetivo ?? "");
  const [contactoNombre, setContactoNombre] = useState(base.contacto_nombre ?? "");
  const [contactoTel, setContactoTel] = useState(base.contacto_telefono ?? "");
  const [contactoEmail, setContactoEmail] = useState(base.contacto_email ?? "");
  const [cuota, setCuota] = useState(base.cuota_mensual == null ? "" : String(base.cuota_mensual));
  const [notas, setNotas] = useState(base.notas ?? "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const cuotaNum = cuota.trim() === "" ? null : Number(cuota.replace(/\./g, "").replace(",", "."));
    if (cuotaNum != null && (!Number.isFinite(cuotaNum) || cuotaNum < 0)) {
      setError("La cuota tiene que ser un número, sin el signo $.");
      return;
    }
    setGuardando(true);
    setError("");
    const err = await onGuardar({
      nombre: nombre.trim(),
      nivel: textoONull(nivel),
      // Individual no tiene grupo, aunque haya quedado uno elegido.
      grupo_id: modalidad === "individual" ? null : grupoId || null,
      modalidad,
      // Y grupal no tiene horario propio: usa el del grupo.
      horario: modalidad === "individual" ? textoONull(horario) : null,
      es_menor: esMenor,
      objetivo: textoONull(objetivo),
      contacto_nombre: textoONull(contactoNombre),
      contacto_telefono: textoONull(contactoTel),
      contacto_email: textoONull(contactoEmail),
      cuota_mensual: cuotaNum,
      notas: textoONull(notas),
    });
    setGuardando(false);
    if (err) setError(err);
  }

  return (
    <form onSubmit={enviar} className="formulario formulario-ficha">
      <label>
        Nombre y apellido
        <input required maxLength={TOPES.nombre} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </label>

      <fieldset className="opciones">
        <legend>Modalidad</legend>
        <label className="casilla">
          <input type="radio" name="modalidad" checked={modalidad === "grupal"} onChange={() => setModalidad("grupal")} />
          En grupo
        </label>
        <label className="casilla">
          <input
            type="radio"
            name="modalidad"
            checked={modalidad === "individual"}
            onChange={() => setModalidad("individual")}
          />
          Individual
        </label>
      </fieldset>

      {modalidad === "grupal" && (
        <label>
          Grupo
          <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
            <option value="">Sin grupo por ahora</option>
            {grupos
              .filter((g) => g.activo || g.id === grupoId)
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                  {g.horario ? ` · ${g.horario}` : ""}
                </option>
              ))}
          </select>
        </label>
      )}

      {modalidad === "individual" && (
        <label>
          Horario
          <input
            maxLength={TOPES.horario}
            placeholder="Ej.: martes 17:30"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
        </label>
      )}

      <div className="dos-columnas">
        <label>
          Nivel
          <input
            maxLength={TOPES.nivel}
            placeholder="Ej.: Kids 2, B1, First"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
          />
        </label>
        <label>
          Cuota mensual ($)
          <input inputMode="decimal" placeholder="Ej.: 30000" value={cuota} onChange={(e) => setCuota(e.target.value)} />
        </label>
      </div>

      <label>
        Objetivo
        <input
          maxLength={TOPES.objetivo}
          placeholder="Ej.: rendir el First en diciembre"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
        />
      </label>

      <label className="casilla">
        <input type="checkbox" checked={esMenor} onChange={(e) => setEsMenor(e.target.checked)} />
        Es menor de edad
      </label>

      <fieldset className="grupo-campos">
        <legend>{esMenor ? "Contacto de la familia" : "Contacto"}</legend>
        {esMenor && (
          <label>
            Nombre (mamá, papá o tutor)
            <input
              maxLength={TOPES.contacto_nombre}
              value={contactoNombre}
              onChange={(e) => setContactoNombre(e.target.value)}
            />
          </label>
        )}
        <div className="dos-columnas">
          <label>
            WhatsApp
            <input
              type="tel"
              inputMode="tel"
              maxLength={TOPES.contacto_telefono}
              placeholder="Ej.: 249 4123456"
              value={contactoTel}
              onChange={(e) => setContactoTel(e.target.value)}
            />
          </label>
          <label>
            Mail
            <input
              type="email"
              maxLength={TOPES.contacto_email}
              value={contactoEmail}
              onChange={(e) => setContactoEmail(e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <label>
        Notas
        <textarea rows={3} maxLength={TOPES.notas} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </label>

      {error && (
        <p className="aviso aviso-alerta" role="alert">
          {error}
        </p>
      )}

      <div className="botonera">
        <button type="submit" className="boton boton-zona" disabled={guardando}>
          {guardando ? "Guardando…" : textoBoton}
        </button>
        <button type="button" className="boton-texto" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
