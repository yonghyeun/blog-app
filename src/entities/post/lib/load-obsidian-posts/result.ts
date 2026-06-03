export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

export const success = <T>(data: T): Result<T, never> => ({
  ok: true,
  data,
});

export const failure = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});
