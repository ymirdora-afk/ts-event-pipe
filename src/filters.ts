/** Predicate-based event filtering for typed event pipes. */
export type EventFilter<T> = (payload: T) => boolean;

export function createFilteredListener<T>(
  filter: EventFilter<T>,
  listener: (payload: T) => void | Promise<void>,
): (payload: T) => void | Promise<void> {
  return (payload: T) => {
    if (filter(payload)) return listener(payload);
  };
}

export function debounceListener<T>(
  listener: (payload: T) => void,
  delayMs: number,
): (payload: T) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (payload: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => listener(payload), delayMs);
  };
}
