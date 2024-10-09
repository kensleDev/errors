// Credit: https://blog.avansai.com/en/handling-errors-in-typescript-the-right-way/

/**
 * A normalized error object to safely handle `unknown` values being thrown.
 */
export class NormalizedError extends Error {
  /** The error's stack or a fallback to the `message` if the stack is unavailable. */
  override stack: string = "";
  /** The original value that was thrown. */
  originalValue: unknown;

  /**
   * Initializes a new instance of the `NormalizedError` class.
   *
   * @param error - An `Error` object.
   * @param originalValue - The original value that was thrown.
   */
  constructor(error: Error, originalValue?: unknown) {
    super(error.message);
    this.stack = error.stack ?? this.message;
    this.originalValue = originalValue ?? error;

    // Set the prototype explicitly, for `instanceof` to work correctly when transpiled to ES5.
    Object.setPrototypeOf(this, NormalizedError.prototype);
  }
}

/**
 * Type guard to check if an `unknown` value is an `Error` object.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is an `Error` object, otherwise `false`.
 */
export const isError = (value: unknown): value is Error =>
  !!value &&
  typeof value === "object" &&
  "message" in value &&
  typeof value.message === "string" &&
  "stack" in value &&
  typeof value.stack === "string";

/**
 * Type guard to check if an `unknown` value is a `NormalizedError` object.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a `NormalizedError` object, otherwise `false`.
 */
export const isNormalizedError = (value: unknown): value is NormalizedError =>
  isError(value) && "originalValue" in value && value.stack !== undefined;

/**
 * Converts an `unknown` value that was thrown into a `NormalizedError` object.
 *
 * @param value - An `unknown` value.
 *
 * @returns A `NormalizedError` object.
 */
export const toNormalizedError = <E>(
  value: E extends NormalizedError ? never : E,
): NormalizedError => {
  if (isError(value)) {
    return new NormalizedError(value);
  } else {
    try {
      return new NormalizedError(
        new Error(
          `Unexpected value thrown: ${
            typeof value === "object" ? JSON.stringify(value) : String(value)
          }`,
        ),
        value,
      );
    } catch {
      return new NormalizedError(
        new Error(`Unexpected value thrown: non-stringifiable object`),
        value,
      );
    }
  }
};

/**
 * Type guard to check if an `unknown` function call result is a `Promise`.
 *
 * @param result - The function call result to check.
 *
 * @returns `true` if the value is a `Promise`, otherwise `false`.
 */
export const isPromise = (result: unknown): result is Promise<unknown> =>
  !!result &&
  typeof result === "object" &&
  "then" in result &&
  typeof result.then === "function" &&
  "catch" in result &&
  typeof result.catch === "function";

type NoThrowResult<A> =
  A extends Promise<infer U>
    ? Promise<U | NormalizedError>
    : A | NormalizedError;

/**
 * Perform an action without throwing errors.
 *
 * Try/catch blocks can be hard to read and can cause scoping issues. This wrapper
 * avoids those pitfalls by returning the appropriate result based on whether the function
 * executed successfully or not.
 *
 * @param action - The action to perform.
 *
 * @returns The result of the action when successful, or a `NormalizedError` object otherwise.
 */
export const noThrow = <A>(action: () => A): NoThrowResult<A> => {
  try {
    const result = action();
    if (isPromise(result)) {
      return result.catch(toNormalizedError) as NoThrowResult<A>;
    }
    return result as NoThrowResult<A>;
  } catch (error) {
    return toNormalizedError(error) as NoThrowResult<A>;
  }
};

export function logError(
  error: unknown,
  context = "General context",
  extraInfo: Record<string, unknown> = {},
) {
  const errorObject = error instanceof Error ? error : new Error(String(error));

  console.error({
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: errorObject.name ?? "No name available",
      message: errorObject.message ?? "No message available",
      stack: errorObject.stack ?? "No stack trace available",
    },
    extraInfo,
  });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
