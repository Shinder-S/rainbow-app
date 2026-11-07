-- Rainbow OS — dos ajustes del modelo (07/11/2026)
--
-- Salen de la validación del modelo de datos de la Semana 2 (machete de
-- Arquitectura y stack, sección 3.4, huecos 1 y 2). Los dos son para las
-- clases individuales, que no tienen grupo.
--
-- No hay tablas nuevas: los grants de 20261107_base.sql son por tabla y ya
-- cubren las columnas nuevas.

begin;

-- 1) Horario de las clases individuales.
--    En los grupales el horario es el del grupo (grupos.horario). Texto libre,
--    igual que ahí: "martes 17:30".
alter table public.alumnos
  add column horario text check (char_length(horario) <= 120);

comment on column public.alumnos.horario is
  'Sólo para clases individuales. Los grupales usan grupos.horario.';

-- 2) Clases preparadas para un alumno individual.
--    Una clase puede ser de un grupo, de un alumno o general por nivel (las
--    dos vacías), pero no de un grupo y un alumno a la vez.
--    No se exige "grupo o alumno": grupo_id es ON DELETE SET NULL, y con esa
--    regla borrar un grupo con clases fallaría.
alter table public.clases
  add column alumno_id uuid references public.alumnos (id) on delete set null;

alter table public.clases
  add constraint clases_grupo_o_alumno check (grupo_id is null or alumno_id is null);

create index clases_alumno_idx on public.clases (alumno_id);

commit;

-- Verificar después de aplicar:
--   select column_name, data_type from information_schema.columns
--    where table_schema = 'public'
--      and ((table_name = 'alumnos' and column_name = 'horario')
--        or (table_name = 'clases' and column_name = 'alumno_id'));      -- 2 filas
--   select has_column_privilege('authenticated', 'public.alumnos', 'horario', 'UPDATE');  -- true
--   select has_column_privilege('anon', 'public.alumnos', 'horario', 'SELECT');           -- false
