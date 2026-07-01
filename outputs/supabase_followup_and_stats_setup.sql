-- Supabase setup for follow-up contact collection and optional aggregate monitoring.
-- Run this in Supabase SQL Editor with project owner privileges.

-- ============================================================
-- 1. Follow-up contact table
-- ============================================================
-- This table is intentionally separated from the anonymous survey response table
-- because it may contain contact information.

create extension if not exists pgcrypto;

create table if not exists public.followup_contacts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null,
  created_at timestamptz not null default now(),

  study_version text not null,
  language text,
  contact text not null,
  metadata jsonb not null default '{}'::jsonb,

  constraint followup_contact_not_empty
    check (length(trim(contact)) > 0),
  constraint followup_contact_reasonable_size
    check (length(contact) <= 300)
);

alter table public.followup_contacts enable row level security;

revoke all on public.followup_contacts from anon, authenticated;
grant usage on schema public to anon;
grant insert on public.followup_contacts to anon;

drop policy if exists "allow anonymous followup contact submissions"
on public.followup_contacts;

create policy "allow anonymous followup contact submissions"
on public.followup_contacts
for insert
to anon
with check (
  length(trim(contact)) > 0
  and length(contact) <= 300
);

create index if not exists followup_contacts_created_at_idx
on public.followup_contacts (created_at);

create index if not exists followup_contacts_participant_id_idx
on public.followup_contacts (participant_id);

-- Ask PostgREST to reload schema cache so the frontend can see the new table.
notify pgrst, 'reload schema';


-- ============================================================
-- 2. Optional aggregate monitoring function
-- ============================================================
-- This function returns aggregate counts only. It does not expose raw responses.
-- By default it is not granted to anon. Grant execute only if you create a public
-- or password-protected dashboard that should read these counts.

create or replace function public.get_survey_response_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_responses', (select count(*) from public.survey_responses),
    'responses_today', (
      select count(*)
      from public.survey_responses
      where created_at >= date_trunc('day', now())
    ),
    'latest_response_at', (
      select max(created_at)
      from public.survey_responses
    ),
    'by_language', (
      select coalesce(jsonb_object_agg(coalesce(language, 'unknown'), count), '{}'::jsonb)
      from (
        select language, count(*)::int
        from public.survey_responses
        group by language
      ) t
    ),
    'by_study_version', (
      select coalesce(jsonb_object_agg(study_version, count), '{}'::jsonb)
      from (
        select study_version, count(*)::int
        from public.survey_responses
        group by study_version
      ) t
    ),
    'no_intent_selected', (
      select count(*)::int
      from public.survey_responses
      where coalesce((metadata->>'noIntentSelected')::boolean, false) = true
    ),
    'followup_contacts', (
      select to_regclass('public.followup_contacts') is not null
    )
  );
$$;

revoke all on function public.get_survey_response_stats() from public;

-- Optional: uncomment this only if an anon-accessible dashboard should show aggregate counts.
-- grant execute on function public.get_survey_response_stats() to anon;

