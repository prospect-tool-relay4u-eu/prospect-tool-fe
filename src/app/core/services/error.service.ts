import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

const CODE_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Please correct the highlighted fields.',
  BAD_REQUEST: 'Invalid request.',
  REGISTER_INVALID: 'Could not create your account. Please check the entered data.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account locked after too many failed attempts. Please try again later.',
  EMAIL_NOT_VERIFIED: 'Account not verified. Check your email inbox.',
  EMAIL_ALREADY_VERIFIED: 'This account is already verified.',
  EMAIL_ALREADY_REGISTERED: 'An account with this email already exists.',
  INVALID_VERIFICATION_CODE: 'Invalid verification code.',
  VERIFICATION_CODE_EXPIRED: 'Verification code has expired. Please request a new code.',
  VERIFICATION_BLOCKED: 'Verification attempt limit exceeded. Please request a new code.',
  RESEND_RATE_LIMIT: 'Code sending limit exceeded. Please wait an hour.',
  PASSWORD_NOT_SET: 'This account does not have a password set yet.',
  PROJECT_NOT_FOUND: 'Project not found.',
  FIELD_KEY_CONFLICT: 'A field with this key already exists.',
  INVALID_FIELD_VALUE: 'Invalid field value.',
  ACCESS_DENIED: 'You do not have permission to perform this action.',
  INTERNAL_ERROR: 'An unexpected server error occurred. Please try again later.',
};

const CATEGORY_MESSAGES: Record<string, string> = {
  network: 'Unable to reach the server. Please check your internet connection.',
  timeout: 'The server is not responding. Please try again.',
  server: 'An unexpected server error occurred. Please try again later.',
};

const GENERIC_MESSAGE = 'An error occurred. Please try again.';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  parse(err: HttpErrorResponse): ApiError {
    const body = err.error as Record<string, unknown> | null | undefined;
    const code = typeof body?.['code'] === 'string' ? (body['code'] as string) : undefined;

    if (err.status === 0) {
      return { status: 0, code, category: code === 'TIMEOUT' ? 'timeout' : 'network' };
    }

    return {
      status: err.status,
      code,
      detail: typeof body?.['detail'] === 'string' ? (body['detail'] as string) : undefined,
      correlationId:
        typeof body?.['correlationId'] === 'string' ? (body['correlationId'] as string) : undefined,
      errors:
        body?.['errors'] && typeof body['errors'] === 'object'
          ? (body['errors'] as Record<string, string>)
          : undefined,
      category: err.status >= 500 ? 'server' : undefined,
    };
  }

  messageFor(apiError: ApiError): string {
    if (apiError.code && CODE_MESSAGES[apiError.code]) {
      return CODE_MESSAGES[apiError.code];
    }
    if (apiError.category && CATEGORY_MESSAGES[apiError.category]) {
      return CATEGORY_MESSAGES[apiError.category];
    }
    if (apiError.detail) {
      return apiError.detail;
    }
    return GENERIC_MESSAGE;
  }
}
