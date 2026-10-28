import { useEffect, useState } from 'react';

/** Relógio compartilhado para reavaliar a sinalização de dados desatualizados. */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [intervalMs]);

  return now;
}
