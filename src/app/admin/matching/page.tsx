export default function AdminMatchingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Matching</h1>
      <p className="mt-1 text-sm text-zinc-500">Qualifizierte Leads an Händler zuordnen.</p>
      <div className="card mt-8">
        <p className="text-sm text-zinc-600">Matching-Workflow: Wählen Sie qualifizierte Leads aus und ordnen Sie sie passenden Händlern (nach PLZ-Radius, Budget, Marken) zu.</p>
        <button className="btn-primary mt-4 text-sm">Auto-Match starten</button>
      </div>
    </div>
  );
}
