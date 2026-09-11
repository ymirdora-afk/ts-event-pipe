export type EventMap = Record<string, unknown>;

export type Listener<T = unknown> = (data: T) => void | Promise<void>;

export type WildcardListener<Events extends EventMap = EventMap> = <K extends keyof Events>(
  event: K,
  data: Events[K]
) => void | Promise<void>;

export interface EventPipeOptions {
  concurrency?: number;
  highWaterMark?: number;
}

export interface EventPipe<Events extends EventMap> {
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void;
  on(event: '*', listener: WildcardListener<Events>): () => void;
  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void;
  off(event: '*', listener: WildcardListener<Events>): void;
  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void;
  once(event: '*', listener: WildcardListener<Events>): () => void;
  emit<K extends keyof Events>(event: K, data: Events[K]): Promise<void>;
  listenerCount(event?: keyof Events | '*'): number;
  clear(): void;
}
