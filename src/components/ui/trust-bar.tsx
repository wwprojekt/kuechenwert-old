export function TrustBar() {
  const TRUST_ITEMS = [
    { text: "100% kostenlos" },
    { text: "Unverbindlich" },
    { text: "Geprüfte Fachhändler" },
    { text: "Telefonische Beratung" },
  ];

  return (
    <div className="bg-brand-900 text-white">
      <div className="section-container flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-2">
        {TRUST_ITEMS.map((item) => (
          <span key={item.text} className="flex items-center gap-1.5 text-xs font-medium text-brand-200">
            <svg className="h-3.5 w-3.5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
