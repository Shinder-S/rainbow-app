"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlumnoForm, type DatosAlumno } from "@/components/AlumnoForm";
import { getSupabase } from "@/lib/supabase";
import { COLUMNAS_GRUPO, mensajeError, type Grupo } from "@/lib/alumnos";

export default function NuevoAlumno() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  useEffect(() => {
    getSupabase()
      ?.from("grupos")
      .select(COLUMNAS_GRUPO)
      .order("nombre")
      .then(({ data }) => setGrupos((data as Grupo[]) ?? []));
  }, []);

  async function guardar(datos: DatosAlumno): Promise<string | null> {
    const sb = getSupabase();
    if (!sb) return "Falta conectar la base de datos.";
    const { data, error } = await sb.from("alumnos").insert(datos).select("id").single();
    if (error) return mensajeError(error);
    router.replace(`/so/alumnos/${data.id}`);
    return null;
  }

  return (
    <section className="zona-pagina" style={{ "--zona": "var(--c-naranja)" } as React.CSSProperties}>
      <Link href="/so/alumnos" className="enlace volver">
        ← Alumnos
      </Link>
      <h1>Nuevo alumno</h1>
      <AlumnoForm
        grupos={grupos}
        textoBoton="Guardar alumno"
        onGuardar={guardar}
        onCancelar={() => router.push("/so/alumnos")}
      />
    </section>
  );
}
