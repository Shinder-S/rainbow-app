# CLAUDE.md — Rainbow OS (rainbow-app)

SO de **Rainbow**, el instituto de inglés de **Graciela** en Tandil: única profesora, unos 35 alumnos (unas 30 familias), grupos de hasta 8 alumnos, muchos menores. **Única usuaria: Graciela**, que no es técnica y lo usa desde el celular. El documento del SO (Semana 1 del CCA) está en `../Rainbow — Documento del SO Semana 1 — Claude Code Accelerator.md` y manda sobre el alcance.

**Zona prioritaria #1: Operativa.** Mínimo de la Semana 6 = 5 zonas: **Alumnos** (ficha única; grupos y horarios viven acá), **Correcciones con IA** (writings), **Clases con IA**, **Cuotas** y **Avisos** (texto listo para pegar en WhatsApp, sin envío automático). Backlog en orden: Creación (redes y landing), Comercial, portal de alumnos y familias, WhatsApp automático, recordatorio de cuotas y Medición. **Si dudás si algo entra, va afuera.**

## Stack
El mismo de On The Rocks (`../../On The Rocks/otr-app`, que es la referencia para patrones y decisiones): Next.js 16 (App Router) + React 19 + TypeScript · Supabase (Postgres + RLS + Auth con mail y contraseña) con `@supabase/ssr` (la sesión vive en cookies) · IA: Claude vía API, **sólo desde el servidor** (Sonnet para correcciones y clases, Haiku para avisos) · Deploy en Vercel · **es-AR, ARS, DD/MM, mobile-first**.

## Comandos
`npm run dev` (:3000) · `npm run build` · `npm run start`. Env: `.env.example` → `.env.local`; **nunca commitear secrets**.

## Estructura
`src/app/` rutas · `src/components/` · `src/lib/` = lógica sin UI (`env`, `supabase`, `zonas`) · `src/styles.css` · `src/proxy.ts` cierra `/so` en el servidor (sólo `role = 'admin'`) · `supabase/migrations/` = cambios de la base.
**`src/lib/zonas.ts` es la fuente única de las zonas**: de ahí salen el menú y las tarjetas del inicio.

## Seguridad (heredada de On The Rocks, no romper)
- **RLS en todas las tablas**; hoy todo es admin-only vía `is_admin()` (SECURITY DEFINER).
- **Grants explícitos en toda tabla o vista nueva**: Supabase dejó de darlos solo (30/10/2026). `revoke all ... from anon, public`, después `grant` a `authenticated` y a `service_role`. Verificar con `has_table_privilege()`, no mirando el panel.
- **Tope de largo en todo campo de texto libre.**
- **Vistas con `security_invoker = on`** (si no, saltean la RLS).
- Funciones: revocar EXECUTE de PUBLIC y verificar con `has_function_privilege()`. Un REVOKE apunta a una firma: si la firma cambia, hay que repetirlo.
- El rol admin se da **a mano en la base**; el registro público va apagado en Supabase Auth.
- Las keys de IA nunca llevan `NEXT_PUBLIC_`; la CSP de `next.config.ts` sólo abre Supabase en `connect-src`.
- **Datos de menores**: nada de datos reales en scripts de prueba, demos ni capturas.

## Estado
- **07/11/2026:** la base está creada (app, proxy, login, las 5 zonas como páginas "en construcción" y la migración `20261107_base.sql`).
- **07/11/2026 (Supabase):** proyecto `sfstbjylfmycpwwyykmj` (us-east-2) en la organización **Rainbow** de Graciela; Santiago es Administrator. La migración base se aplicó **desde el SQL Editor** (el conector MCP de esta máquina todavía no veía la organización) y se verificó: RLS + 1 policy por tabla, `anon` sin nada, `authenticated` con lo justo, funciones con EXECUTE revocado. Ese proyecto venía con permisos por defecto para `authenticated`: la migración ahora los limpia. `.env.local` usa la clave `sb_publishable_…`. Zona **Alumnos** hecha (lista, ficha, notas de avance, grupos). **Landing pública en `/`** (`src/app/page.tsx` + `landing.css`): la única ruta indexable. Las fotos van en `public/fotos/`, con permiso de las familias, sin nombres y sin EXIF; la fuente está en `../fotos-web` y `../material grafico`. Identidad: naranja, verde y un toque de violeta, con Comic Sans (Comic Neue en los celulares), ver `../identidad-de-marca.md`. Usuario de Graciela creado (`ruiz1441@gmail.com`, perfil `role = 'admin'`) y registro público apagado (`disable_signup: true`, verificado).
- **07/11/2026 (deploy):** repo privado `Shinder-S/rainbow-app` (rama `main`) conectado a Vercel, proyecto `rainbow-app` en el equipo "On the Rocks": cada push a `main` despliega solo. Producción en **https://rainbow-app-pi.vercel.app**. Variables en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SITE_URL` (sólo Production). Site URL de Supabase Auth = esa dirección. Si se suma un dominio propio, cambiar las dos cosas. El conector MCP de Vercel no ve este proyecto: se maneja desde el panel.
- **07/11/2026 (Semana 2):** machete `../Rainbow — Arquitectura y stack Semana 2 — Claude Code Accelerator.md`. Aplicados los ajustes 1 y 2 de su validación del modelo (`20261107_horario_y_clase_individual.sql`, desde el SQL Editor): `alumnos.horario` (sólo individuales; la ficha usa `horarioDe()`) y `clases.alumno_id` con la regla "grupo y alumno nunca a la vez". Pendientes del modelo: hermanos (juntar por teléfono en Avisos) y una tabla de aperturas para la métrica.
- **14/11/2026 (landing):** correcciones de Graciela por audios de WhatsApp. El video de "Hablar en inglés, de verdad" va **con sonido y controles**, recortado para que arranque después de que las alumnas dicen sus nombres. En Exámenes, un alumno rindiendo y una tira de alumnos con su certificado: **los nombres de los certificados van borroneados** (las fotos con DNI o nombres legibles quedaron afuera). Las fotos se preparan con Pillow (recorte, borroneo, sin EXIF), fuera del repo.
