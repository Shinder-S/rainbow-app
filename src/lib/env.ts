/** Env pública del cliente.
 *
 * Next sólo reemplaza `process.env.NEXT_PUBLIC_*` en el bundle del navegador
 * cuando el acceso es ESTÁTICO (la clave escrita literal). Con
 * `process.env[variable]` en el cliente queda undefined: por eso se leen una
 * por una.
 *
 * Sin valores de respaldo en el código, igual que en On The Rocks: es mejor
 * que la app no arranque por una variable faltante a que arranque con una
 * credencial vieja después de una rotación. */
function limpiar(v: string | undefined): string {
  return v?.trim() ?? "";
}

export const env = {
  supabaseUrl: limpiar(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: limpiar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};
