-- ============================================================
-- Migration 003: Storage Buckets fuer Lead-Files
--   Bucket "lead-files" speichert Funnel-B-Uploads:
--     - Angebot (PDF / Bild)
--     - Grundriss (PDF / Bild)
--     - Bild der gewuenschten Kueche (Bild)
--   Privater Bucket: nur Admins + jeweiliger Lead-Ersteller +
--   gekaufte Haendler duerfen lesen.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-files',
  'lead-files',
  false,
  10485760, -- 10 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf'
  ]
)
on conflict (id) do nothing;

-- Anonyme Funnel-B-Verbraucher koennen ueber API-Endpoint hochladen
-- (API nutzt Service-Role und Pfad `lead-files/{lead_id}/...`).
-- Daher hier nur Lese-Policies fuer Endkunden + Admins.

do $$ begin
  create policy "Admins read all lead files"
    on storage.objects for select
    using (
      bucket_id = 'lead-files'
      and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Dealers read lead files of purchased leads"
    on storage.objects for select
    using (
      bucket_id = 'lead-files'
      and exists (
        select 1
        from public.match_candidates mc
        join public.dealers d on d.id = mc.dealer_id
        join public.lead_files lf on lf.lead_id = mc.lead_id
        where d.user_id = auth.uid()
          and mc.is_purchased = true
          and storage.objects.name like (mc.lead_id::text || '/%')
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Service role full access"
    on storage.objects for all
    using (bucket_id = 'lead-files' and auth.role() = 'service_role');
exception when duplicate_object then null; end $$;
