-- =====================================================================
-- 010_kitchen_price_brackets_seed.sql
--
-- Seed-Werte fuer kitchen_price_brackets (B2C-Preisrange fuer Funnel C).
--
-- Logik:
--   Basispreis pro Kuechenform:
--     zeile    = 1.0x (Grundwert)
--     l        = 1.15x
--     u        = 1.30x
--     parallel = 1.25x
--     g        = 1.35x
--     insel    = 1.50x (aufwaendigste Form)
--
--   Basispreise pro Segment-Kombination (Stil x Geraete x Arbeitsplatte):
--     Summe aus drei Achsen, dann x Kuechenform-Faktor.
--
--   Werte in CENT.
-- =====================================================================

-- Cleanup vorheriger Seeds (idempotent)
delete from public.kitchen_price_brackets;

do $$
declare
  v_styles  text[]   := array['budget','mittel','premium','luxus'];
  v_appls   text[]   := array['budget','mittel','premium','luxus'];
  v_tops    text[]   := array['basic','mid','premium'];
  v_forms   text[]   := array['zeile','l','u','parallel','g','insel'];
  v_form_mult numeric[];
  v_style text; v_appl text; v_top text; v_form text;
  v_style_base integer; v_appl_base integer; v_top_base integer;
  v_base_min integer; v_base_max integer;
  v_form_factor numeric;
  v_min integer; v_max integer;
  v_form_idx integer;
begin
  v_form_mult := array[1.00, 1.15, 1.30, 1.25, 1.35, 1.50];

  foreach v_style in array v_styles loop
    v_style_base := case v_style
      when 'budget'  then  450000
      when 'mittel'  then  750000
      when 'premium' then 1200000
      when 'luxus'   then 2200000
    end;

    foreach v_appl in array v_appls loop
      v_appl_base := case v_appl
        when 'budget'  then  150000
        when 'mittel'  then  280000
        when 'premium' then  550000
        when 'luxus'   then 1200000
      end;

      foreach v_top in array v_tops loop
        v_top_base := case v_top
          when 'basic'   then   80000
          when 'mid'     then  250000
          when 'premium' then  550000
        end;

        v_base_min := v_style_base + v_appl_base + v_top_base;
        -- +35% Spreizung fuer Max (Range bildet Unsicherheit ab)
        v_base_max := round(v_base_min * 1.35);

        v_form_idx := 1;
        foreach v_form in array v_forms loop
          v_form_factor := v_form_mult[v_form_idx];
          v_min := round(v_base_min * v_form_factor);
          v_max := round(v_base_max * v_form_factor);

          insert into public.kitchen_price_brackets
            (style_segment, appliance_segment, worktop_tier, kitchen_form,
             price_min_cents, price_max_cents, active)
          values
            (v_style, v_appl, v_top, v_form, v_min, v_max, true);

          v_form_idx := v_form_idx + 1;
        end loop;
      end loop;
    end loop;
  end loop;
end $$;

-- Sanity-Check: 4 * 4 * 3 * 6 = 288 Brackets
do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.kitchen_price_brackets;
  if v_count <> 288 then
    raise exception 'Seed-Count falsch: % (erwartet 288)', v_count;
  end if;
end $$;
