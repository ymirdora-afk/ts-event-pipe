/** Event replay buffer for late subscribers. */
export class ReplayBuffer<T> {
  private buffer: Array<{ event: string; payload: T; timestamp: number }> = [];

  constructor(private readonly maxSize: number = 100) {}

  push(event: string, payload: T): void {
    this.buffer.push({ event, payload, timestamp: Date.now() });
    if (this.buffer.length > this.maxSize) this.buffer.shift();
  }

  replay(listener: (event: string, payload: T) => void): void {
    for (const entry of this.buffer) {
      listener(entry.event, entry.payload);
    }
  }

  clear(): void {
    this.buffer = [];
  }

  get size(): number {
    return this.buffer.length;
  }
}
