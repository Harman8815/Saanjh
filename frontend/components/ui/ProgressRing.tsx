'use client';

import { useEffect, useState } from 'react';

export interface ProgressRingProps {
  /** Completion percentage, 0-100. Values are clamped. */
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Optional secondary line under the value (e.g. "4 of 5 tasks"). */
  sublabel?: string;
  /** Ring colour class; defaults to the primary rose. */
  colorClassName?: string;
  className?: string;
}

/**
 * Circular progress indicator for the readiness score and domain breakdowns.
 *
 * The number animates from 0 to its value so the dashboard feels alive on
 * load; the stroke uses a stroke-dasharray trick rather than a conic gradient
 * so it renders identically in every browser.
 */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  colorClassName = 'text-primary',
  className = '',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // Animate toward the target in a short rAF loop; cheap and dependency-free.
    let frame = 0;
    const start = performance.now();
    const duration = 600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out so the number settles rather than stopping abruptly.
      setDisplayed(clamped * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - displayed / 100);

  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      role="img"
      aria-label={`${Math.round(clamped)}%${label ? ` ${label}` : ''}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-white/10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colorClassName} transition-none`}
            style={{ stroke: 'currentColor' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="heading-data text-data-2xl text-text-primary">
            {Math.round(displayed)}%
          </span>
          {sublabel && (
            <span className="body-data text-data-xs text-text-secondary">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="body-data mt-2 text-data-sm text-text-secondary">{label}</span>
      )}
    </div>
  );
}

export default ProgressRing;
