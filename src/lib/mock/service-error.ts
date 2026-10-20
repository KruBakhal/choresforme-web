import type { ServiceErrorCode } from "@/lib/types";

/** A rejected mock service call: a code screens can branch on, plus the message to show. */
export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
  }

  /** True for the `?mockError=1` simulated failure. */
  get isMock(): boolean {
    return this.code === "MOCK_ERROR";
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}
