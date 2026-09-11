/** Middleware pattern for event pipes — intercept and transform events. */
export type EventMiddleware<T> = (payload: T, next: (payload: T) => void | Promise<void>) => void | Promise<void>;

export function composeMiddleware<T>(
  ...middlewares: EventMiddleware<T>[]
): (payload: T, final: (payload: T) => void | Promise<void>) => void | Promise<void> {
  return (payload, final) => {
    let index = 0;
    const dispatch = (p: T): void | Promise<void> => {
      if (index >= middlewares.length) return final(p);
      const mw = middlewares[index++];
      return mw(p, dispatch);
    };
    return dispatch(payload);
  };
}
