/**
 * Custom exceptions and error classes for Reactive Resume API Client.
 */

export class ReactiveResumeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReactiveResumeError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends ReactiveResumeError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ReactiveResumeAPIError extends ReactiveResumeError {
  readonly statusCode?: number;
  readonly responseBody?: unknown;

  constructor(message: string, statusCode?: number, responseBody?: unknown) {
    super(message);
    this.name = "ReactiveResumeAPIError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }

  override toString(): string {
    const codeStr = this.statusCode ? ` [Status ${this.statusCode}]` : "";
    return `${this.message}${codeStr}`;
  }
}

export class AuthenticationError extends ReactiveResumeAPIError {
  constructor(message: string, statusCode = 401, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends ReactiveResumeAPIError {
  constructor(message: string, statusCode = 404, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "NotFoundError";
  }
}
