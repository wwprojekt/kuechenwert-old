import { LEAD_PRICING, CPA_TIERS, SUBSCRIPTION_PLANS } from "@/config/revenue";

export default function AdminPricingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Pricing-Konfiguration</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">Lead-Preise (PPL)</h2>
          <table className="mt-4 w-full text-sm"><tbody>
            {Object.entries(LEAD_PRICING.tiers).map(([key, tier]) => (
              <tr key={key} className="border-t border-zinc-100"><td className="py-2">{tier.label}</td><td className="py-2 text-right font-semibold">{tier.priceEur} €</td></tr>
            ))}
          </tbody></table>
        </div>
        <div className="card">
          <h2 className="font-semibold">CPA-Staffel</h2>
          <table className="mt-4 w-full text-sm"><tbody>
            {CPA_TIERS.map((tier, i) => (
              <tr key={i} className="border-t border-zinc-100"><td className="py-2">{tier.minEur.toLocaleString("de-DE")} – {tier.maxEur === Infinity ? "∞" : tier.maxEur.toLocaleString("de-DE")} €</td><td className="py-2 text-right font-semibold">{(tier.rate * 100).toFixed(1)}%</td></tr>
            ))}
          </tbody></table>
        </div>
        <div className="card lg:col-span-2">
          <h2 className="font-semibold">Abo-Pläne</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
              <div key={plan.id} className="rounded-lg border border-zinc-200 p-4">
                <p className="font-semibold">{plan.label}</p>
                <p className="text-2xl font-bold">{plan.monthlyEur} €<span className="text-sm font-normal text-zinc-500">/Monat</span></p>
                <ul className="mt-3 space-y-1 text-sm text-zinc-600">{plan.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
