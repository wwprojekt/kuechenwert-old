import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Share2,
  Phone,
  Mail,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  getSessionById,
  getRendersForSession,
  getSignedImageUrl,
  countRefineIterations,
} from "@/lib/planner/session";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";
import { RefineChat } from "@/components/funnel/traumkueche/refine-chat";
import { REFINE_ITERATION_LIMIT } from "@/lib/planner/refine-limits";
import { renderFloorplanSvg } from "@/lib/planner/floorplan-svg";
import {
  APPLIANCE_SEGMENTS,
  FRONT_COLORS,
  KITCHEN_FORMS,
  KITCHEN_STYLES,
  SURFACE_FINISHES,
  WORKTOP_CHOICES,
  KITCHEN_SIZES,
} from "@/config/funnel-traumkueche-stammdaten";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;
  return {
    title: "Dein Moodboard - KüchenWert",
    description: "Dein persönliches KI-generiertes Küchen-Moodboard plus Preisrange.",
    openGraph: {
      title: "Meine Traumkueche - Moodboard",
      description: "Mit dem KI-Planer von KüchenWert erstellt.",
      images: sessionId ? [`/api/planner/sessions/${sessionId}/og`] : [],
    },
    robots: { index: false, follow: false },
  };
}

export default async function TraumkuecheErgebnisPage({ params }: Props) {
  const { sessionId } = await params;
  const session = await getSessionById(sessionId);
  if (!session) notFound();

  const spec = (session.spec ?? {}) as Partial<TraumkuecheData>;
  const renders = await getRendersForSession(session.id);
  const latestSuccess = [...renders]
    .reverse()
    .find((r) => r.status === "success" && r.image_path);

  const imageUrl = latestSuccess?.image_path
    ? await getSignedImageUrl(latestSuccess.image_path, 60 * 60 * 24)
    : null;

  const priceRangeFormatted =
    session.price_range_min_cents != null && session.price_range_max_cents != null
      ? `${fmtEur(session.price_range_min_cents)} - ${fmtEur(
          session.price_range_max_cents,
        )} EUR`
      : null;

  const style = KITCHEN_STYLES.find((s) => s.slug === spec.styleSlug);
  const surface = SURFACE_FINISHES.find((s) => s.slug === spec.surfaceFinishSlug);
  const color = FRONT_COLORS.find((c) => c.slug === spec.frontColorSlug);
  const worktop = WORKTOP_CHOICES.find((w) => w.slug === spec.worktopSlug);
  const form = KITCHEN_FORMS.find((f) => f.slug === spec.kitchenForm);
  const size = KITCHEN_SIZES.find((s) => s.slug === spec.kitchenSize);
  const segment = APPLIANCE_SEGMENTS.find((a) => a.slug === spec.applianceSegment);

  const contactCaptured = !!session.contact_captured_at;
  const iterationCount = await countRefineIterations(session.id);
  const floorplanSvg = renderFloorplanSvg(spec as TraumkuecheData, {
    width: 720,
    height: 420,
  });

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Mini-Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="section-container flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-display text-lg font-bold tracking-tight-2 text-black"
          >
            <span>Küchen</span>
            <span>Wert</span>
            <span
              className="ml-0.5 inline-block h-1.5 w-1.5 translate-y-1 rounded-full bg-brand-500"
              aria-hidden
            />
          </Link>
          <a
            href="tel:+493055580100"
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 sm:text-sm"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Fragen? </span>
            <span>+49 30 - 555 80 100</span>
          </a>
        </div>
      </header>

      <main className="section-container py-8 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Linke Spalte: Bild */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Dein Moodboard
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight-2 text-black sm:text-3xl">
              Deine Traumkueche
            </h1>
            <p className="mt-1 text-[14px] text-ink-muted">
              {[style?.label, color?.label, form?.label, segment?.label]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <div className="relative mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-card-elevated">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Dein KI-generiertes Moodboard"
                  width={latestSuccess?.image_width ?? 1920}
                  height={latestSuccess?.image_height ?? 1080}
                  className="h-auto w-full object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="grid aspect-video place-items-center gap-2 p-6 text-center text-sm text-ink-muted">
                  <div className="font-semibold text-ink">
                    Dein Moodboard wird noch gerendert …
                  </div>
                  <p className="text-[13px]">
                    Das dauert meist nur wenige Sekunden. Lade die Seite gleich neu.
                  </p>
                  <Link
                    href="/funnel/traumkueche/stil"
                    className="text-[13px] font-semibold text-brand-700 underline"
                  >
                    Oder Planer neu starten
                  </Link>
                </div>
              )}
            </div>

            {/* Phase 2: schematische Draufsicht */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Schematische Draufsicht
              </div>
              <div
                className="mt-2 flex justify-center"
                aria-label="Draufsicht der Küche"
                dangerouslySetInnerHTML={{ __html: floorplanSvg }}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ShareButton sessionId={sessionId} />
              <Link
                href="/funnel/traumkueche/stil"
                className="btn-secondary"
                prefetch={false}
              >
                Neu planen
              </Link>
            </div>

            {/* Phase 2: Refine-Chat */}
            {imageUrl && latestSuccess && (
              <div className="mt-6">
                <RefineChat
                  sessionToken={session.session_token}
                  initialRender={{
                    id: latestSuccess.id,
                    imageUrl,
                    version: latestSuccess.version,
                  }}
                  enabled={contactCaptured}
                  initialIterationCount={iterationCount}
                  iterationLimit={REFINE_ITERATION_LIMIT}
                />
              </div>
            )}
          </div>

          {/* Rechte Spalte: Preisrange + Spec + CTAs */}
          <aside className="space-y-5">
            {priceRangeFormatted && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                  Vorläufige Preisrange
                </div>
                <div className="mt-1 font-display text-2xl font-bold tracking-tight-2 text-black">
                  {priceRangeFormatted}
                </div>
                {session.expert_note && (
                  <div className="mt-3 flex gap-2 rounded-lg bg-surface-soft p-3 text-[13px] leading-relaxed text-ink-muted">
                    <Info
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      aria-hidden
                    />
                    <div>{session.expert_note}</div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Deine Auswahl
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {style && <SpecPill label="Stil" value={style.label} />}
                {surface && <SpecPill label="Oberfläche" value={surface.label} />}
                {color && <SpecPill label="Farbe" value={color.label} swatch={color.hex} />}
                {worktop && <SpecPill label="Arbeitsplatte" value={worktop.label} />}
                {form && <SpecPill label="Form" value={form.label} />}
                {size && <SpecPill label="Größe" value={size.label} />}
                {segment && <SpecPill label="Geräte" value={segment.label} />}
                {(spec.storageFeatures ?? []).length > 0 && (
                  <SpecPill
                    label="Ausstattung"
                    value={`${(spec.storageFeatures ?? []).length} Features`}
                  />
                )}
                {(spec.applianceLayouts ?? []).length > 0 && (
                  <SpecPill
                    label="Anordnung"
                    value={`${(spec.applianceLayouts ?? []).length} Details`}
                  />
                )}
              </div>
            </div>

            {contactCaptured ? (
              <div className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50/40 p-5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <div className="font-display text-base font-bold text-black">
                      Moodboard gesichert
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                      Unser Experte meldet sich kurzfristig per E-Mail mit deiner
                      detaillierten Einschätzung und einer Empfehlung für einen
                      passenden Küchenstudio-Partner in deiner Region.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href="tel:+493055580100"
                    className="btn-primary w-full justify-center"
                  >
                    <Phone className="h-4 w-4" /> Jetzt anrufen
                  </a>
                  <a href="mailto:beratung@kuechenwert.de" className="btn-secondary w-full justify-center">
                    <Mail className="h-4 w-4" /> E-Mail schreiben
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-5">
                <div className="font-display text-base font-bold text-black">
                  Moodboard jetzt sichern
                </div>
                <p className="text-[13px] leading-relaxed text-ink-muted">
                  Name und E-Mail angeben, damit der Experte dir die genaue
                  Einschätzung sendet und du das Ergebnis teilen kannst.
                </p>
                <Link
                  href="/funnel/traumkueche/kontakt"
                  className="btn-primary-lg w-full justify-center"
                  prefetch={false}
                >
                  Moodboard sichern
                </Link>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6">
        <div className="section-container flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-muted">
          <div>(C) KüchenWert</div>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:underline">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:underline">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SpecPill({
  label,
  value,
  swatch,
}: {
  label: string;
  value: string;
  swatch?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px]">
      {swatch && (
        <span
          aria-hidden
          className="h-3 w-3 rounded-full border border-black/10"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className="text-ink-subtle">{label}:</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function ShareButton({ sessionId }: { sessionId: string }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kuechenwert.de";
  const url = `${base}/funnel/traumkueche/ergebnis/${sessionId}`;
  return (
    <a
      href={`mailto:?subject=Meine Traumkueche&body=Hier mein KüchenWert-Moodboard: ${encodeURIComponent(
        url,
      )}`}
      className="btn-secondary"
    >
      <Share2 className="h-4 w-4" /> Teilen
    </a>
  );
}

function fmtEur(cents: number): string {
  return new Intl.NumberFormat("de-DE").format(Math.round(cents / 100));
}
