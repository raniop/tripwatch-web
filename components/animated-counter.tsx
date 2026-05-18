'use client';

import { useEffect, useState } from 'react';

interface Props {
  to: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedCounter({ to, durationMs = 1400, format, className }: Props) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);

  const formatter = format ?? ((n: number) => n.toLocaleString('en-US'));
  return <span className={className}>{formatter(value)}</span>;
}
