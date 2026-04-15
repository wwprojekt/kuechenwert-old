import { clsx } from "clsx";

interface ComparisonColumn {
  key: string;
  label: string;
  /** Highlight this column as recommended */
  highlight?: boolean;
}

interface ComparisonRow {
  feature: string;
  values: Record<string, string | boolean>;
}

interface ComparisonTableProps {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  className?: string;
}

function CellContent({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <svg
        className="mx-auto h-5 w-5 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ) : (
      <svg
        className="mx-auto h-5 w-5 text-zinc-300"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  return <span>{value}</span>;
}

export function ComparisonTable({
  columns,
  rows,
  className,
}: ComparisonTableProps) {
  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Merkmal
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider",
                  col.highlight
                    ? "bg-brand-50 text-brand-800"
                    : "text-zinc-500",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((row, i) => (
            <tr key={i} className="transition hover:bg-zinc-50">
              <td className="px-4 py-3.5 font-medium text-zinc-800">
                {row.feature}
              </td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx(
                    "px-4 py-3.5 text-center text-zinc-600",
                    col.highlight && "bg-brand-50/50",
                  )}
                >
                  <CellContent value={row.values[col.key] ?? "–"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
