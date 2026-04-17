import { useState, useEffect } from 'react';

export interface CountdownResult {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Human-readable label e.g. "2d 3h 14m" or "45m 12s" */
  label: string;
}

export function useCountdown(deadline?: number): CountdownResult | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    // Tick every second
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;

  const diff = deadline - now;

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, label: '' };
  }

  const totalSec = Math.floor(diff / 1000);
  const days    = Math.floor(totalSec / 86400);
  const hours   = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  let label = '';
  if (days > 0)    label = `${days}d ${hours}h ${minutes}m`;
  else if (hours > 0) label = `${hours}h ${minutes}m ${seconds}s`;
  else if (minutes > 0) label = `${minutes}m ${seconds}s`;
  else              label = `${seconds}s`;

  return { expired: false, days, hours, minutes, seconds, label };
}
