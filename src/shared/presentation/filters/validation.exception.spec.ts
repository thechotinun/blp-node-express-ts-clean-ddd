import { z } from 'zod';
import { DomainException } from '../../domain/exceptions/domain.exception.js';
import { flattenZodIssues, validate, ValidationException } from './validation.exception.js';

describe('ValidationException', () => {
	it('should be a DomainException with the validate error code and VALIDATION kind', () => {
		const exception = new ValidationException(['name: required']);

		expect(exception).toBeInstanceOf(DomainException);
		expect(exception.errorCode).toBe(900422);
		expect(exception.kind).toBe('VALIDATION');
		expect(exception.errors).toEqual(['name: required']);
	});
});

describe('flattenZodIssues', () => {
	const schema = z.object({
		name: z.string().min(1, 'should not be empty'),
		address: z.object({ geo: z.object({ lat: z.number('must be a number') }) }),
	});

	it('should prefix each message with its dotted path', () => {
		const result = schema.safeParse({ name: '', address: { geo: { lat: 'x' } } });

		expect(result.success).toBe(false);
		expect(flattenZodIssues(result.error!.issues)).toEqual([
			'name: should not be empty',
			'address.geo.lat: must be a number',
		]);
	});

	it('should return the bare message for a root-level issue', () => {
		const result = z.string('must be a string').safeParse(1);

		expect(flattenZodIssues(result.error!.issues)).toEqual(['must be a string']);
	});
});

describe('validate', () => {
	const schema = z.object({ page: z.coerce.number() });

	it('should return the parsed data on success', () => {
		expect(validate(schema, { page: '2' })).toEqual({ page: 2 });
	});

	it('should throw a ValidationException on failure', () => {
		expect(() => validate(schema, { page: 'x' })).toThrow(ValidationException);
	});
});
