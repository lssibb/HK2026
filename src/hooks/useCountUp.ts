import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from its currently displayed value to `target` with an
 * ease-out. Skips the animation under reduced motion, and continues smoothly
 * from the current value when `target` changes mid-flight.
 */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(target);
  // Tracks the value currently on screen so a new target animates from there.
  const valueRef = useRef(target);

  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      valueRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
