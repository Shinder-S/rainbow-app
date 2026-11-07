-- Rainbow OS — esquema base (07/11/2026)
--
-- Las 5 zonas del mínimo de la Semana 6: alumnos (con grupos y avances),
-- correcciones, clases, cuotas y avisos. Una sola usuaria: Graciela, con rol
-- admin otorgado A MANO en la base (no hay auto-registro de admin).
--
-- Reglas que vienen de On The Rocks y se aplican desde el día uno:
--   · RLS en TODAS las tablas. Hoy todo es admin-only.
--   · Grants explícitos: Supabase ya no los da solo a las tablas nuevas de
--     public (desde el 30/10/2026). Sin GRANT, la app recibe "permission
--     denied" aunque la RLS la deje pasar. Se revoca todo y se da lo justo.
--   · Tope de largo en TODO campo de texto libre.
--   · Toda vista nueva sobre tablas con RLS: `with (security_invoker = on)`.
--   · Funciones: revocar EXECUTE de PUBLIC (Postgres lo concede por defecto) y
--     verificar con has_function_privilege(), no mirando el panel.
--
-- Datos sensibles: muchos alumnos son menores. Nada de esto es público.

begin;

-- ─────────────────────────────────────────────────────────────────────────
-- 1) Perfiles y rol
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text check (char_length(email) <= 254),
  name text check (char_length(name) <= 120),
  -- 'pendiente' hasta que se otorgue un rol a mano. 'alumno' y 'familia'
  -- quedan reservados para el portal del backlog.
  role text not null default 'pendiente'
    check (role in ('pendiente', 'admin', 'alumno', 'familia')),
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER para que las policies puedan preguntar el rol sin entrar
-- en recursión de RLS sobre profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Cada alta en auth.users crea su perfil, sin rol. El trigger vive en el
-- esquema auth: si se migra de proyecto, confirmar que exista.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, left(new.email, 254))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Cada uno lee su propio perfil (el proxy lo necesita para leer el rol).
-- Nadie se cambia el rol solo: no hay policy de UPDATE para no admins.
create policy profiles_lee_lo_suyo on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_escribe on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 2) Grupos y alumnos
-- ─────────────────────────────────────────────────────────────────────────
create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 60),
  nivel text check (char_length(nivel) <= 40),
  -- Texto libre a propósito ("lunes y miércoles 18:00"): los horarios se
  -- acuerdan con cada grupo y no hace falta modelarlos todavía.
  horario text check (char_length(horario) <= 120),
  notas text check (char_length(notas) <= 1000),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.alumnos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 120),
  nivel text check (char_length(nivel) <= 40),
  grupo_id uuid references public.grupos (id) on delete set null,
  modalidad text not null default 'grupal' check (modalidad in ('grupal', 'individual')),
  es_menor boolean not null default false,
  -- Examen internacional, ingreso a la universidad o al profesorado, etc.
  objetivo text check (char_length(objetivo) <= 200),
  -- Contacto: la familia si es menor, el propio alumno si es adulto.
  contacto_nombre text check (char_length(contacto_nombre) <= 120),
  contacto_telefono text check (char_length(contacto_telefono) <= 30),
  contacto_email text check (char_length(contacto_email) <= 254),
  cuota_mensual numeric(12, 2) check (cuota_mensual >= 0),
  notas text check (char_length(notas) <= 4000),
  -- Se desactiva, no se borra: su historial de cuotas y writings sigue
  -- teniendo que poder explicarse.
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index alumnos_grupo_idx on public.alumnos (grupo_id);

-- Notas de avance de la ficha: una por entrada, con fecha, en vez de un solo
-- campo que se pisa. Es lo que hoy vive en el cuaderno.
create table public.avances (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos (id) on delete cascade,
  fecha date not null default current_date,
  nota text not null check (char_length(nota) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index avances_alumno_idx on public.avances (alumno_id, fecha desc);

create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger alumnos_updated_at
  before update on public.alumnos
  for each row execute function public.tocar_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- 3) Cuotas
-- ─────────────────────────────────────────────────────────────────────────
create table public.cuotas (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos (id) on delete cascade,
  -- Primer día del mes al que corresponde (2026-11-01 = noviembre).
  periodo date not null check (extract(day from periodo) = 1),
  monto numeric(12, 2) not null check (monto >= 0),
  pagada boolean not null default false,
  pagada_el date,
  medio text check (medio in ('efectivo', 'transferencia', 'otro')),
  notas text check (char_length(notas) <= 500),
  created_at timestamptz not null default now(),
  -- Una cuota por alumno por mes.
  unique (alumno_id, periodo),
  check (not pagada or pagada_el is not null)
);
create index cuotas_periodo_idx on public.cuotas (periodo, pagada);

-- ─────────────────────────────────────────────────────────────────────────
-- 4) Correcciones de writings
-- ─────────────────────────────────────────────────────────────────────────
create table public.correcciones (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos (id) on delete cascade,
  fecha date not null default current_date,
  titulo text check (char_length(titulo) <= 120),
  consigna text check (char_length(consigna) <= 2000),
  -- El texto del alumno, tipeado o transcripto de la foto.
  texto_alumno text check (char_length(texto_alumno) <= 20000),
  -- Ruta en Storage de la foto del writing escrito a mano (bucket privado).
  imagen_path text check (char_length(imagen_path) <= 300),
  -- Lo que propone la IA y lo que Graciela entrega se guardan por separado:
  -- la devolución final es SIEMPRE suya.
  borrador_ia text check (char_length(borrador_ia) <= 20000),
  devolucion_final text check (char_length(devolucion_final) <= 20000),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'borrador', 'revisada', 'entregada')),
  created_at timestamptz not null default now()
);
create index correcciones_alumno_idx on public.correcciones (alumno_id, fecha desc);
create index correcciones_estado_idx on public.correcciones (estado);

-- ─────────────────────────────────────────────────────────────────────────
-- 5) Preparación de clases
-- ─────────────────────────────────────────────────────────────────────────
create table public.clases (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid references public.grupos (id) on delete set null,
  nivel text check (char_length(nivel) <= 40),
  tema text not null check (char_length(tema) between 1 and 200),
  fecha date,
  -- Qué trae el libro para esa clase (unidad, páginas, ejercicios).
  libro_referencia text check (char_length(libro_referencia) <= 500),
  borrador_ia text check (char_length(borrador_ia) <= 30000),
  contenido_final text check (char_length(contenido_final) <= 30000),
  created_at timestamptz not null default now()
);
create index clases_fecha_idx on public.clases (fecha desc);

-- ─────────────────────────────────────────────────────────────────────────
-- 6) Avisos
-- ─────────────────────────────────────────────────────────────────────────
create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 1 and 120),
  cuerpo text not null check (char_length(cuerpo) between 1 and 4000),
  destino text not null default 'todos' check (destino in ('todos', 'grupo', 'alumno')),
  grupo_id uuid references public.grupos (id) on delete set null,
  alumno_id uuid references public.alumnos (id) on delete set null,
  -- Se marca a mano al pegarlo en WhatsApp: el envío automático es backlog.
  enviado_el timestamptz,
  created_at timestamptz not null default now(),
  check (destino <> 'grupo' or grupo_id is not null),
  check (destino <> 'alumno' or alumno_id is not null)
);

-- ─────────────────────────────────────────────────────────────────────────
-- 7) RLS: todo admin-only
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['grupos', 'alumnos', 'avances', 'cuotas', 'correcciones', 'clases', 'avisos']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t || '_solo_admin', t
    );
  end loop;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 8) Grants explícitos
-- ─────────────────────────────────────────────────────────────────────────
revoke all on public.profiles, public.grupos, public.alumnos, public.avances,
  public.cuotas, public.correcciones, public.clases, public.avisos
  from anon, public;

-- Algunos proyectos todavía traen permisos por defecto para authenticated
-- (el de Rainbow, creado el 07/11, le daba todo): se limpia y se da lo justo.
revoke all on public.profiles, public.grupos, public.alumnos, public.avances,
  public.cuotas, public.correcciones, public.clases, public.avisos
  from authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.grupos, public.alumnos, public.avances,
  public.cuotas, public.correcciones, public.clases, public.avisos
  to authenticated;

-- Para las Edge Functions y los scripts de backup (saltea RLS).
grant all on public.profiles, public.grupos, public.alumnos, public.avances,
  public.cuotas, public.correcciones, public.clases, public.avisos
  to service_role;

-- Funciones: PUBLIC tiene EXECUTE por defecto. Las de trigger no se invocan
-- por RPC; is_admin sólo la necesita quien tiene sesión.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.tocar_updated_at() from public, anon, authenticated;

commit;

-- ─────────────────────────────────────────────────────────────────────────
-- Después de aplicar:
--   1. Crear el usuario de Graciela (Authentication → Users → Add user, con
--      el mail confirmado) y darle el rol a mano:
--        update public.profiles set role = 'admin', name = 'Graciela'
--        where email = '<su mail>';
--   2. Apagar el registro público: Authentication → Sign In / Providers →
--      "Allow new users to sign up" en OFF. Nadie más necesita cuenta.
--   3. Verificar los grants con has_table_privilege(), no mirando el panel:
--        select has_table_privilege('anon', 'public.alumnos', 'SELECT');          -- false
--        select has_table_privilege('authenticated', 'public.alumnos', 'INSERT'); -- true
--        select has_table_privilege('service_role', 'public.cuotas', 'INSERT');   -- true
-- ─────────────────────────────────────────────────────────────────────────
