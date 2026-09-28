import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpStatusMessages } from '../constants/http-status-messages.constant.js';
import { DomainException, type DomainErrorKind } from '../../domain/exceptions/domain.exception.js';

const HTTP_INTERNAL_SERVER_ERROR = 500;

/**
 * How each domain error kind is reported over HTTP — the single place to change it.
 */
const httpStatusByKind: Record<DomainErrorKind, number> = {
	VALIDATION: 422,
	NOT_FOUND: 404,
	CONFLICT: 409,
	BUSINESS_RULE: 422,
};

/** Error keys the HTTP layer raises itself, for failures that never reach the domain. */
type HttpErrorKey = 'UNDEFINED_ERROR' | 'UNAUTHORIZED' | 'BAD_REQUEST';

/** Turns an error key into the code and message clients see (see src/error-codes.registry.ts). */
export type ResolveErrorKey = (key: string) => { code: number; message: string };

interface ErrorResponseInterface {
	status: { code: number; message: string };
	error: { code: number; message: string; errors: string[] };
}

interface ResolvedError {
	statusCode: number;
	errorKey: string;
	errors: string[];
}

/** Errors raised by Express / body-parser (e.g. malformed JSON) carry their own 4xx status. */
function clientErrorStatus(exception: unknown): number | undefined {
	const status = (exception as { status?: unknown } | null)?.status;

	return typeof status === 'number' && status >= 400 && status < 500 ? status : undefined;
}

function resolveError(exception: unknown): ResolvedError {
	const errors = exception instanceof Error ? [exception.message] : [];

	if (exception instanceof DomainException) {
		return {
			statusCode: httpStatusByKind[exception.kind],
			errorKey: exception.message,
			errors: exception.errors,
		};
	}

	const status = clientErrorStatus(exception);

	if (status !== undefined) {
		const errorKey: HttpErrorKey =
			status === 401 || status === 403 ? 'UNAUTHORIZED' : 'BAD_REQUEST';

		return { statusCode: status, errorKey, errors };
	}

	return { statusCode: HTTP_INTERNAL_SERVER_ERROR, errorKey: 'UNDEFINED_ERROR', errors };
}

/**
 * Error handlers that render `{ status, error: { code, message, errors } }`, where `message`
 * and `code` come from `resolveKey`. Register `notFoundHandler` then `exceptionFilter` last.
 */
export function createErrorHandlers(resolveKey: ResolveErrorKey): {
	exceptionFilter: ErrorRequestHandler;
	notFoundHandler: RequestHandler;
} {
	const buildErrorResponse = (
		statusCode: number,
		errorKey: string,
		errors: string[],
	): ErrorResponseInterface => ({
		status: { code: statusCode, message: HttpStatusMessages[statusCode] ?? '' },
		error: { ...resolveKey(errorKey), errors },
	});

	return {
		exceptionFilter: (exception: unknown, _req, res, _next) => {
			const { statusCode, errorKey, errors } = resolveError(exception);

			if (statusCode === HTTP_INTERNAL_SERVER_ERROR) {
				// oxlint-disable-next-line no-console -- no logger yet; unexpected errors must still surface
				console.error(exception);
			}

			res.status(statusCode).json(buildErrorResponse(statusCode, errorKey, errors));
		},
		notFoundHandler: (req, res) => {
			res
				.status(404)
				.json(
					buildErrorResponse(404, 'UNDEFINED_ERROR', [`Route ${req.method} ${req.path} not found`]),
				);
		},
	};
}
