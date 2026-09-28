import type { NextFunction, Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception.js';
import { ValidationException } from '../../domain/exceptions/validation.exception.js';
import { createErrorHandlers } from './exception.filter.js';

const codes: Record<string, number> = {
	UNDEFINED_ERROR: 0,
	UNAUTHORIZED: 900403,
	VALIDATE_ERROR: 900422,
	BAD_REQUEST: 900423,
	THING_NOT_FOUND: 990001,
};
const { exceptionFilter, notFoundHandler } = createErrorHandlers((key) => {
	const code = codes[key];

	return code === undefined
		? { code: 900001, message: 'UNREGISTERED_ERROR_KEY' }
		: { code, message: key };
});

const buildResponse = () => {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	const res = { status } as unknown as Response;

	return { res, status, json };
};

const run = (exception: unknown) => {
	const { res, status, json } = buildResponse();
	exceptionFilter(exception, {} as Request, res, vi.fn() as NextFunction);

	return { status, json };
};

describe('exceptionFilter', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	it('should report NOT_FOUND as 404 with the error in the body', () => {
		const { status, json } = run(
			new DomainException('THING_NOT_FOUND', 'NOT_FOUND', ['not found']),
		);

		expect(status).toHaveBeenCalledWith(404);
		expect(json).toHaveBeenCalledWith({
			status: { code: 404, message: 'Not Found' },
			error: { code: 990001, message: 'THING_NOT_FOUND', errors: ['not found'] },
		});
	});

	it.each([
		['VALIDATION', 422],
		['CONFLICT', 409],
		['BUSINESS_RULE', 422],
	] as const)('should report %s as %i', (kind, code) => {
		const { status } = run(new DomainException('THING_CREATE_ERROR', kind));

		expect(status).toHaveBeenCalledWith(code);
	});

	it('should send the code and message resolveKey gives for an unregistered key', () => {
		const { json } = run(new DomainException('ORDER_LOCKED', 'BUSINESS_RULE', ['locked']));

		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: { code: 900001, message: 'UNREGISTERED_ERROR_KEY', errors: ['locked'] },
			}),
		);
	});

	it('should default an unknown error to 500 with the generic error code', () => {
		const { status, json } = run(new Error('boom'));

		expect(status).toHaveBeenCalledWith(500);
		expect(json).toHaveBeenCalledWith({
			status: { code: 500, message: 'Internal Server Error' },
			error: { code: 0, message: 'UNDEFINED_ERROR', errors: ['boom'] },
		});
	});

	it.each([401, 403])('should map a %i error to the unauthorized error code', (code) => {
		const { status, json } = run(Object.assign(new Error('no access'), { status: code }));

		expect(status).toHaveBeenCalledWith(code);
		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: expect.objectContaining({ code: 900403, message: 'UNAUTHORIZED' }),
			}),
		);
	});

	it('should map a body-parser 400 error to the bad request error code', () => {
		const { status, json } = run(
			Object.assign(new SyntaxError('Unexpected token'), { status: 400 }),
		);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			status: { code: 400, message: 'Bad Request' },
			error: { code: 900423, message: 'BAD_REQUEST', errors: ['Unexpected token'] },
		});
	});

	it('should keep the flattened validation messages for a ValidationException', () => {
		const { status, json } = run(new ValidationException(['name: should not be empty']));

		expect(status).toHaveBeenCalledWith(422);
		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({
				error: {
					code: 900422,
					message: 'VALIDATE_ERROR',
					errors: ['name: should not be empty'],
				},
			}),
		);
	});
});

describe('notFoundHandler', () => {
	it('should respond 404 in the error envelope', () => {
		const { res, status, json } = buildResponse();

		notFoundHandler({ method: 'GET', path: '/nope' } as Request, res, vi.fn());

		expect(status).toHaveBeenCalledWith(404);
		expect(json).toHaveBeenCalledWith({
			status: { code: 404, message: 'Not Found' },
			error: { code: 0, message: 'UNDEFINED_ERROR', errors: ['Route GET /nope not found'] },
		});
	});
});
