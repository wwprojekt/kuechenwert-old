/**
 * Passthrough-Layout fuer alle /funnel/*-Routen.
 *
 * Jeder Sub-Funnel (a, b, quiz, planung, angebote) bringt seinen eigenen
 * Shell mit Header, Progress-Bar, Trust-Badges und Sticky-Footer mit.
 * Ein zusaetzlicher aeusserer Header hier fuehrte zu doppelten Logos
 * und doppelter main-Box – daher bewusst leer.
 */
export default function FunnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
