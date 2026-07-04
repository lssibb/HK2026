import type { ReactNode } from "react";
import { Droplet } from "lucide-react";

import { moistureTone } from "@/lib/care";
import { cn } from "@/lib/utils";

const THICKNESS = 4; // stroke width in the 100×100 viewBox
const R = 50 - THICKNESS;
const C = 2 * Math.PI * R;

/**
 * Wraps a plant tile in a radial "thirst" gauge: the arc fills as the watering
 * interval elapses and shifts colour fresh → thirsty → overdue. Turns an
 * abstract cadence into a glanceable, living signal.
 */
export function MoistureRing({
  progress,
  size,
  children,
  splash = false,
  className,
}: {
  /** 0 = just watered, 1 = due now, >1 = overdue. undefined = reminders off. */
  progress: number | undefined;
  size: number;
  children: ReactNode;
  /** Play the watering ripple overlay (toggle to replay). */
  splash?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(progress ?? 0, 1));
  const offset = progress == null ? C : C * (1 - clamped);
  const inset = THICKNESS + 2;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          strokeWidth={THICKNESS}
          className="stroke-current text-border"
        />
        <circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          strokeWidth={THICKNESS}
          strokeLinecap="round"
          className={cn(
            "stroke-current transition-[stroke-dashoffset] duration-700 ease-out",
            moistureTone(progress)
          )}
          style={{ strokeDasharray: C, strokeDashoffset: offset }}
        />
      </svg>

      <div className="absolute overflow-hidden rounded-full" style={{ inset }}>
        {children}
      </div>

      {splash && (
        <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span
            className="animate-ripple absolute rounded-full border-2 border-sky-400/60"
            style={{ inset }}
          />
          <Droplet className="animate-drop size-6 fill-sky-400/30 text-sky-400" />
        </span>
      )}
    </div>
  );
}
