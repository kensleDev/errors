# TypeScript Error Handling Utilities

This package provides a set of utilities for robust error handling in TypeScript applications. It offers a standardized way to handle, normalize, and log errors, making it easier to manage exceptions and unexpected behaviors in your code.

NormalizedError, noThrow are from [this blog post](https://blog.avansai.com/en/handling-errors-in-typescript-the-right-way/)

## Features

- `NormalizedError`: A custom error class that wraps thrown values, providing a consistent error structure.
- Type guards for error checking (`isError`, `isNormalizedError`, `isPromise`).
- `toNormalizedError`: Converts any thrown value into a `NormalizedError` object.
- `noThrow`: A utility function to execute code without throwing errors, returning either the result or a `NormalizedError`.
- `logError`: A function for structured error logging.
- `HttpError`: A custom error class for HTTP-related errors.

## Usage

### NormalizedError

Use `NormalizedError` to create a standardized error object:

```typescript
const error = new NormalizedError(new Error("Something went wrong"), originalValue);
```

### noThrow

Wrap potentially throwing code with `noThrow` to handle errors gracefully:

```typescript
const result = noThrow(() => {
  // Your potentially throwing code here
});

if (isNormalizedError(result)) {
  console.log("An error occurred:", result.message);
} else {
  console.log("Operation successful:", result);
}
```

### Error Logging

Use `logError` to log errors in a structured format:

```typescript
try {
  // Your code that might throw an error
} catch (error) {
  logError(error, "User authentication", { userId: 123 });
}
```

### HTTP Errors

Create HTTP-specific errors using the `HttpError` class:

```typescript
throw new HttpError(404, "Resource not found");
```

## Benefits

- Consistent error handling across your application.
- Improved error information and context.
- Safer handling of unknown thrown values.
- Easier debugging with structured error logging.
- Reduced boilerplate in try/catch blocks.
