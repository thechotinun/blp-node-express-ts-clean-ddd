import { DomainException } from './domain.exception.js';
import { ValidationException } from './validation.exception.js';

describe('ValidationException', () => {
	it('should carry the VALIDATE_ERROR key, VALIDATION kind and given errors', () => {
		const exception = new ValidationException(['name: required']);

		expect(exception).toBeInstanceOf(DomainException);
		expect(exception.message).toBe('VALIDATE_ERROR');
		expect(exception.kind).toBe('VALIDATION');
		expect(exception.errors).toEqual(['name: required']);
	});

	it('should default errors to an empty array', () => {
		expect(new ValidationException().errors).toEqual([]);
	});
});
