# ts-event-pipe

A type-safe event emitter for TypeScript and Node.js featuring full async listener support, wildcard subscriptions, and configurable backpressure handling.

## Features

- **Strict Type Safety**: Compile-time event and payload validation.
- **Async & Promise Support**: Awaits asynchronous listeners with concurrent resolution.
- **Wildcard Subscriptions**: Catch-all event listeners using the `'*'` pattern.
- **Backpressure & Concurrency**: Configurable emission queues and concurrency limits.
- **Zero Dependencies**: Lightweight, modern ES module design for Node.js >= 20.

## Installation

```bash
npm install ts-event-pipe
```

## Quick Start

```typescript
import { createEventPipe } from 'ts-event-pipe';

interface AppEvents {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
}

const pipe = createEventPipe<AppEvents>({ concurrency: 5, highWaterMark: 100 });

// Register typed listeners
const unsubscribe = pipe.on('user:login', async ({ userId }) => {
  await logActivity(userId);
});

// Wildcard listener catches all emitted events
pipe.on('*', async (event, data) => {
  console.log(`[Event] ${String(event)}:`, data);
});

// Emit events with async awaiting and backpressure control
await pipe.emit('user:login', { userId: 'usr_123', timestamp: Date.now() });

// Unsubscribe when finished
unsubscribe();
```

## API Reference

- `createEventPipe<EventMap>(options?)`: Creates a new typed event pipe instance.
- `pipe.on(event, listener)`: Subscribes a listener and returns an unsubscribe function.
- `pipe.once(event, listener)`: Subscribes a one-time listener.
- `pipe.off(event, listener)`: Removes a registered listener.
- `pipe.emit(event, data)`: Emits an event, queues if needed, and awaits all listeners.
- `pipe.listenerCount(event?)`: Returns count of active listeners for an event or all events.
- `pipe.clear()`: Clears all listeners, queues, and drain waiters.

## License

MIT
