export function TrustBar() {
  const TRUST_ITEMS = [
    { text: "100% kostenlos", icon: "✓" },
    { text: "Unverbindlich", icon: "✓" },
    { text: "Regionale Studios", icon: "✓" },
    { text: "Geprüfte Händler", icon: "✓" },
  ];

  return (
    <div className="bg-brand-50 border-b border-brand-100">
      <div className="section-container flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-2.5">
        {TRUST_ITEMS.map((item) => (
          <span key={item.text} className="flex items-center gap-1.5 text-xs font-medium text-brand-800">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
              {item.icon}
            </span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
