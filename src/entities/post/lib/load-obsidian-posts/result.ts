export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

/**
 * 성공 값을 Result success branch로 감싼다.
 */
export const success = <T>(data: T): Result<T, never> => ({
  ok: true,
  data,
});

/**
 * 실패 값을 Result failure branch로 감싼다.
 */
export const failure = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});
