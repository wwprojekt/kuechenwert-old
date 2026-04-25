/**
 * Limits fuer den Phase-2-Refinement-Chat.
 * In separates Modul extrahiert, damit Server-Components / Admin-UI die
 * Werte nutzen koennen, ohne den Route-Handler zu importieren.
 */
export const REFINE_ITERATION_LIMIT = 5;
export const REFINE_MESSAGE_MAX_LENGTH = 500;
