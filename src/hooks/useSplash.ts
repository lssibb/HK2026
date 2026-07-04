import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A momentary boolean flag (e.g. the watering ripple) that auto-clears after
 * `durationMs`. The timer is cancelled on unmount and before re-triggering, so
 * it never calls setState on an unmounted component (rows unmount when a task
 * leaves the dashboard right after "Полил").
 */
export function useSplash(durationMs = 850): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const trigger = useCallback(() => {
    setOn(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOn(false), durationMs);
  }, [durationMs]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  return [on, trigger];
}
