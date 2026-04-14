import { createClient } from "@/lib/supabase/server";

export default async function DealerProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dealer } = await supabase
    .from("dealers")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">Händlerprofil</h1>
      <p className="mt-1 text-sm text-zinc-500">Bearbeiten Sie Ihr öffentliches Profil.</p>

      <form className="mt-8 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Firmenname</label>
          <input className="input-field mt-1" defaultValue={dealer?.company_name ?? ""} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Beschreibung</label>
          <textarea className="input-field mt-1" rows={4} defaultValue={dealer?.description ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">PLZ</label>
            <input className="input-field mt-1" defaultValue={dealer?.postal_code ?? ""} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Ort</label>
            <input className="input-field mt-1" defaultValue={dealer?.city ?? ""} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Adresse</label>
          <input className="input-field mt-1" defaultValue={dealer?.address ?? ""} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Telefon</label>
          <input className="input-field mt-1" defaultValue={dealer?.phone ?? ""} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Website</label>
          <input className="input-field mt-1" defaultValue={dealer?.website ?? ""} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Marken (kommagetrennt)</label>
          <input className="input-field mt-1" defaultValue={dealer?.brands?.join(", ") ?? ""} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Serviceradius (km)</label>
          <input className="input-field mt-1" type="number" defaultValue={dealer?.service_radius_km ?? 50} />
        </div>
        <button type="submit" className="btn-primary">Profil speichern</button>
      </form>
    </div>
  );
}
