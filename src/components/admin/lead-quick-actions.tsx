"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Gavel, Loader2 } from "lucide-react";

interface Props {
  leadId: string;
  status: string;
  funnelType: string | null;
  /** Existiert bereits eine Auktion fuer diesen Lead? */
  hasAuction: boolean;
  /** Anzeige-Variante: 'compact' fuer Tabellen-Zellen, 'full' fuer Detail-Header. */
  variant?: "compact" | "full";
}

export function LeadQuickActions({
  leadId,
  status,
  funnelType,
  hasAuction,
  variant = "compact",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isNew = status === "new";
  const isQualified = status === "qualified";
  const isFunnelA = funnelType === "a" || funnelType == null;
  const isFunnelB = funnelType === "b";
  // Funnel-A Leads gehen ueber Marketplace (Status qualified).
  // Funnel-B Leads gehen ueber Experten-Call -> Auction-Editor -> Freigabe;
  // ein direkter "Qualifizieren" Button waere irrefuehrend.
  const showQualifyAction = isNew && isFunnelA;
  const canCreateAuction = isFunnelB && !hasAuction && status !== "disqualified";

  async function patchStatus(newStatus: string, label: string) {
    setBusyAction(label);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Fehler");
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusyAction(null);
    }
  }

  async function createAuction() {
    setBusyAction("auction");
    setError(null);
    try {
      const res = await fetch("/api/admin/auctions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j.error ?? "Fehler");
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusyAction(null);
    }
  }

  const sizeCls = variant === "full" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";
  const iconCls = variant === "full" ? "h-4 w-4" : "h-3 w-3";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${variant === "full" ? "" : "justify-end"}`}>
      {showQualifyAction && (
        <button
          type="button"
          disabled={isPending || busyAction !== null}
          onClick={() => patchStatus("qualified", "qualify")}
          className={`inline-flex items-center gap-1 rounded-md bg-accent-600 font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50 ${sizeCls}`}
        >
          {busyAction === "qualify" ? (
            <Loader2 className={`${iconCls} animate-spin`} />
          ) : (
            <CheckCircle2 className={iconCls} />
          )}
          Qualifizieren
        </button>
      )}
      {isNew && (
        <button
          type="button"
          disabled={isPending || busyAction !== null}
          onClick={() => patchStatus("disqualified", "disqualify")}
          className={`inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white font-medium text-ink-muted transition hover:border-red-300 hover:text-red-700 disabled:opacity-50 ${sizeCls}`}
        >
          {busyAction === "disqualify" ? (
            <Loader2 className={`${iconCls} animate-spin`} />
          ) : (
            <XCircle className={iconCls} />
          )}
          Ablehnen
        </button>
      )}

      {isQualified && isFunnelA && variant === "full" && (
        <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Live im Marketplace
        </span>
      )}

      {canCreateAuction && (
        <button
          type="button"
          disabled={isPending || busyAction !== null}
          onClick={createAuction}
          className={`inline-flex items-center gap-1 rounded-md bg-brand-700 font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-50 ${sizeCls}`}
        >
          {busyAction === "auction" ? (
            <Loader2 className={`${iconCls} animate-spin`} />
          ) : (
            <Gavel className={iconCls} />
          )}
          Auktion-Entwurf
        </button>
      )}

      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
