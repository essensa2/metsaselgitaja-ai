create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  description text,
  owner_name text,
  status text not null default 'draft',
  region text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.forest_areas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  county text not null,
  municipality text,
  size_ha numeric(10, 2) not null,
  dominant_tree_species text,
  last_known_cutting_year integer,
  risk_score integer check (risk_score >= 0 and risk_score <= 100),
  clear_cut_ha numeric(10, 2),
  remote_sensing_change text,
  remote_sensing_change_pct numeric(5, 2),
  centroid_lat double precision,
  centroid_lng double precision,
  geometry_geojson jsonb,
  data_sources text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.datasets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid references public.projects(id) on delete cascade,
  forest_area_id uuid references public.forest_areas(id) on delete cascade,
  name text not null,
  source_name text not null,
  source_url text,
  dataset_type text not null,
  observed_at timestamp with time zone,
  imported_at timestamp with time zone,
  confidence_score numeric(5, 2),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.analysis_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid references public.projects(id) on delete cascade,
  forest_area_id uuid references public.forest_areas(id) on delete cascade,
  title text not null default 'Metsaala raport',
  summary text,
  ai_explanation jsonb not null default '{}'::jsonb,
  risk_score integer check (risk_score >= 0 and risk_score <= 100),
  data_sources text[] not null default array[]::text[],
  generated_by text not null default 'mock-generator',
  generated_at timestamp with time zone not null default now(),
  disclaimer text not null default 'Tegemist on prototüübi automaatse kokkuvõttega. Järeldused tuleb kontrollida algandmetest.'
);

create table if not exists public.team_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  project_id uuid references public.projects(id) on delete cascade,
  forest_area_id uuid references public.forest_areas(id) on delete set null,
  author_name text,
  note text not null,
  note_type text not null default 'general',
  is_resolved boolean not null default false
);

create index if not exists forest_areas_project_id_idx on public.forest_areas(project_id);
create index if not exists datasets_project_id_idx on public.datasets(project_id);
create index if not exists datasets_forest_area_id_idx on public.datasets(forest_area_id);
create index if not exists analysis_reports_forest_area_id_idx on public.analysis_reports(forest_area_id);
create index if not exists team_notes_project_id_idx on public.team_notes(project_id);
