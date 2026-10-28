/** Janela máxima (40 min) antes de sinalizar os dados como desatualizados. */
export const STALE_AFTER_MS = 40 * 60 * 1000;

export function isDataStale(fetchedAt: string, now: number = Date.now()): boolean {
  const fetchedTime = new Date(fetchedAt).getTime();

  if (Number.isNaN(fetchedTime)) {
    return true;
  }

  return now - fetchedTime > STALE_AFTER_MS;
}
