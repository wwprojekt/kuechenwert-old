-- Fix: infinite recursion in "Admins can read all profiles" policy
--
-- Die ursprüngliche Policy fragte profiles aus profiles heraus ab:
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- Das triggert wieder die RLS-Policy auf profiles selbst → infinite recursion.
--
-- Symptom: Jede Query auf public.profiles mit authenticated-Rolle schlug mit
-- "42P17: infinite recursion detected in policy for relation profiles" fehl.
-- Daraus folgte: Jeder Login (Admin + Dealer) landete auf der Startseite,
-- weil profile.role nicht gelesen werden konnte.
--
-- Lösung: SECURITY DEFINER Funktion public.is_admin(), die RLS intern
-- umgeht (läuft als Funktions-Owner, also postgres). Dadurch kein Zyklus mehr.

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
