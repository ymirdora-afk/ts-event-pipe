import type { EventMap, Listener, WildcardListener, EventPipe, EventPipeOptions } from './types.js';

export type * from './types.js';

export function createEventPipe<Events extends EventMap = EventMap>(
  options: EventPipeOptions = {}
): EventPipe<Events> {
  const { concurrency = Infinity, highWaterMark = 100 } = options;
  const listeners = new Map<keyof Events, Set<Listener<any>>>();
  const wildcards = new Set<WildcardListener<Events>>();
  const queue: Array<() => Promise<void>> = [], drainWaiters: Array<() => void> = [];
  let running = 0;

  const flush = (): void => {
    while (queue.length > 0 && running < concurrency) {
      const task = queue.shift()!;
      running++;
      if (queue.length < highWaterMark && drainWaiters.length > 0) drainWaiters.shift()!();
      task().finally(() => { running--; flush(); });
    }
  };

  const pipe: EventPipe<Events> = {
    on(event: any, listener: any): () => void {
      if (event === '*') {
        wildcards.add(listener);
        return () => pipe.off('*', listener);
      }
      const set = listeners.get(event) ?? new Set();
      listeners.set(event, set.add(listener));
      return () => pipe.off(event, listener);
    },

    off(event: any, listener: any): void {
      const target = event === '*' ? wildcards : listeners.get(event);
      if (!target) return;
      for (const fn of target) {
        if (fn === listener || (fn as any)._raw === listener) target.delete(fn);
      }
      if (event !== '*' && (target as Set<unknown>).size === 0) listeners.delete(event);
    },

    once(event: any, listener: any): () => void {
      const wrapper: any = async (...args: any[]) => {
        pipe.off(event, wrapper);
        return listener(...args);
      };
      wrapper._raw = listener;
      return pipe.on(event, wrapper);
    },

    async emit<K extends keyof Events>(event: K, data: Events[K]): Promise<void> {
      if (queue.length >= highWaterMark) {
        await new Promise<void>((resolve) => drainWaiters.push(resolve));
      }
      return new Promise<void>((resolve, reject) => {
        queue.push(async () => {
          try {
            const specific = listeners.get(event) ?? [];
            const calls = [
              ...Array.from(specific, (fn) => fn(data)),
              ...Array.from(wildcards, (fn) => fn(event, data)),
            ];
            await Promise.all(calls);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        flush();
      });
    },

    listenerCount(event?: any): number {
      if (event === '*') return wildcards.size;
      if (event !== undefined) return listeners.get(event)?.size ?? 0;
      return Array.from(listeners.values()).reduce((sum, s) => sum + s.size, wildcards.size);
    },

    clear(): void {
      listeners.clear();
      wildcards.clear();
      queue.length = 0;
      drainWaiters.forEach((r) => r());
      drainWaiters.length = 0;
    },
  };

  return pipe;
}
