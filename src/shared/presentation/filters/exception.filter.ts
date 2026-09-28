import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpStatusMessages } from '../constants/http-status-messages.constant.js';
import { ErrorCodes } from '../../domain/exceptions/error-codes.constant.js';
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

interface ErrorResponseInterface {
	status: { code: number; message: string };
	error: { code: number; message: string; errors: string[] };
}

/**
 * @param [errorMessage] defaults to the generic ErrorCodes name for `errorCode`
 */
function buildErrorResponse(
	statusCode: number,
	errorCode: number,
	errors: string[],
	errorMessage: string = ErrorCodes[errorCode] ?? ErrorCodes[0] ?? '',
): ErrorResponseInterface {
	return {
		status: { code: statusCode, message: HttpStatusMessages[statusCode] ?? '' },
		error: { code: errorCode, message: errorMessage, errors },
	};
}

interface ResolvedError {
	statusCode: number;
	errorCode: number;
	errors: string[];
	errorMessage?: string;
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
			errorCode: exception.errorCode,
			errors: exception.errors,
			errorMessage: exception.message,
		};
	}

	const status = clientErrorStatus(exception);

	if (status !== undefined) {
		const errorCode = status === 401 || status === 403 ? 900403 : 900423;

		return { statusCode: status, errorCode, errors };
	}

	return { statusCode: HTTP_INTERNAL_SERVER_ERROR, errorCode: 0, errors };
}

/** Maps any thrown error to `{ status, error: { code, message, errors } }`. Register last. */
export const exceptionFilter: ErrorRequestHandler = (exception: unknown, _req, res, _next) => {
	const { statusCode, errorCode, errors, errorMessage } = resolveError(exception);

	if (statusCode === HTTP_INTERNAL_SERVER_ERROR) {
		// oxlint-disable-next-line no-console -- no logger yet; unexpected errors must still surface
		console.error(exception);
	}

	res.status(statusCode).json(buildErrorResponse(statusCode, errorCode, errors, errorMessage));
};

export const notFoundHandler: RequestHandler = (req, res) => {
	res.status(404).json(buildErrorResponse(404, 0, [`Route ${req.method} ${req.path} not found`]));
};
