/**
 * Error-code catalog check. Duplicate codes are compile errors in
 * src/error-codes.registry.ts; this covers the runtime lookup.
 */
import { ErrorCodes, resolveErrorKey } from './error-codes.registry.js';

describe('error codes', () => {
	it('should use non-negative integer codes', () => {
		expect(Object.keys(ErrorCodes).every((code) => /^\d+$/.test(code))).toBe(true);
	});

	describe('resolveErrorKey', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should return the code and the key itself for a registered key', () => {
			expect(resolveErrorKey('EXAMPLE_NOT_FOUND')).toEqual({
				code: 100101,
				message: 'EXAMPLE_NOT_FOUND',
			});
		});

		it('should resolve UNDEFINED_ERROR to code 0', () => {
			expect(resolveErrorKey('UNDEFINED_ERROR')).toEqual({ code: 0, message: 'UNDEFINED_ERROR' });
		});

		it('should return UNREGISTERED_ERROR_KEY and warn for an unregistered key', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

			expect(resolveErrorKey('NOPE')).toEqual({ code: 900001, message: 'UNREGISTERED_ERROR_KEY' });
			expect(warn).toHaveBeenCalledWith(expect.stringContaining("'NOPE'"));
		});

		it('should not warn for a registered key', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

			resolveErrorKey('EXAMPLE_NOT_FOUND');

			expect(warn).not.toHaveBeenCalled();
		});
	});
});
