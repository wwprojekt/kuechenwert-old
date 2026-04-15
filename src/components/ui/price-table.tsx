import { clsx } from "clsx";

interface PriceTableColumn {
  key: string;
  label: string;
  /** Right-align numeric columns */
  align?: "left" | "right" | "center";
}

interface PriceTableProps {
  columns: PriceTableColumn[];
  rows: Record<string, string>[];
  /** Optional row that should be highlighted */
  highlightIndex?: number;
  caption?: string;
  className?: string;
}

export function PriceTable({
  columns,
  rows,
  highlightIndex,
  caption,
  className,
}: PriceTableProps) {
  const alignClass = (align?: string) => {
    if (align === "right") return "text-right";
    if (align === "center") return "text-center";
    return "text-left";
  };

  return (
    <div className={clsx("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        {caption && (
          <caption className="mb-3 text-left text-xs text-zinc-500">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b-2 border-brand-600">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-800",
                  alignClass(col.align),
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((row, i) => (
            <tr
              key={i}
              className={clsx(
                "transition hover:bg-zinc-50",
                i === highlightIndex && "bg-brand-50 font-semibold",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx(
                    "px-4 py-3.5 text-zinc-700",
                    alignClass(col.align),
                    i === highlightIndex && "text-brand-800",
                  )}
                >
                  {row[col.key] ?? "–"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
