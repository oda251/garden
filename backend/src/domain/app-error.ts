import { err, ok, ResultAsync } from "neverthrow";
import type { Result } from "neverthrow";

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
} as const;

type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

type AppErrorData = {
  readonly code: string;
  readonly message: string;
  readonly status: HttpStatus;
};

export type AppError = AppErrorData;

export const AppError = {
  badRequest: (message = "Bad request"): AppError => ({
    code: "BAD_REQUEST",
    message,
    status: HTTP_STATUS.BAD_REQUEST,
  }),

  unauthorized: (message = "Unauthorized"): AppError => ({
    code: "UNAUTHORIZED",
    message,
    status: HTTP_STATUS.UNAUTHORIZED,
  }),

  forbidden: (message = "Forbidden"): AppError => ({
    code: "FORBIDDEN",
    message,
    status: HTTP_STATUS.FORBIDDEN,
  }),

  notFound: (message = "Not found"): AppError => ({
    code: "NOT_FOUND",
    message,
    status: HTTP_STATUS.NOT_FOUND,
  }),

  conflict: (message = "Conflict"): AppError => ({
    code: "CONFLICT",
    message,
    status: HTTP_STATUS.CONFLICT,
  }),

  internal: (message = "Internal server error"): AppError => ({
    code: "INTERNAL",
    message,
    status: HTTP_STATUS.INTERNAL,
  }),

  fromUnknown: (error: unknown): AppError => {
    if (error instanceof Error) {
      return AppError.internal(error.message);
    }
    return AppError.internal("An unexpected error occurred");
  },

  toResponse: (
    appError: AppError,
  ): { status: HttpStatus; body: { code: string; message: string } } => ({
    status: appError.status,
    body: { code: appError.code, message: appError.message },
  }),

  ok: <T>(value: T): Result<T, AppError> => ok(value),

  fail: <T = never>(appError: AppError): Result<T, AppError> => err(appError),

  fromPromise: <T>(
    promise: Promise<T>,
    mapError?: (error: unknown) => AppError,
  ): ResultAsync<T, AppError> =>
    ResultAsync.fromPromise(
      promise,
      mapError ?? ((error: unknown) => AppError.fromUnknown(error)),
    ),
} as const;
