"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Arcoiris } from "@/components/Arcoiris";
import { getSupabase, supabaseConfigurado } from "@/lib/supabase";

/** Mensajes de Supabase Auth en castellano. Los que no están acá salen con un
 * texto genérico: nunca se le muestra a Graciela un error en inglés. */
function traducirError(mensaje: string): string {
  if (/invalid login credentials/i.test(mensaje)) return "El mail o la contraseña no coinciden.";
  if (/email not confirmed/i.test(mensaje)) return "Falta confirmar el mail de la cuenta.";
  if (/rate limit|too many/i.test(mensaje)) return "Hubo muchos intentos seguidos. Probá de nuevo en unos minutos.";
  return "No se pudo ingresar. Probá de nuevo.";
}

export default function Ingresar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const configurado = supabaseConfigurado();

  async function ingresar(e: FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setEnviando(true);
    setError("");
    const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password: clave });
    setEnviando(false);
    if (err) {
      setError(traducirError(err.message));
      return;
    }
    // refresh para que el proxy vea la cookie nueva.
    router.replace("/so");
    router.refresh();
  }

  return (
    <main className="ingreso">
      <div className="ingreso-tarjeta">
        <Arcoiris tamano={88} />
        <h1>Rainbow</h1>
        <p className="ingreso-sub">Instituto de inglés · Tandil</p>

        {!configurado ? (
          <p className="aviso aviso-alerta">
            Falta conectar la base de datos. Completá <code>.env.local</code> con los datos de Supabase (ver{" "}
            <code>.env.example</code>).
          </p>
        ) : (
          <form onSubmit={ingresar} className="formulario">
            <label>
              Mail
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                required
                value={clave}
                onChange={(e) => setClave(e.target.value)}
              />
            </label>
            {error && (
              <p className="aviso aviso-alerta" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="boton" disabled={enviando}>
              {enviando ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
