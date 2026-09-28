import { DomainException } from '../../../shared/domain/exceptions/domain.exception.js';
import { ExampleException } from './example.exception.js';

describe('ExampleException', () => {
	it('should build an EXAMPLE_NOT_FOUND exception', () => {
		const exception = ExampleException.notFound();

		expect(exception).toBeInstanceOf(ExampleException);
		expect(exception).toBeInstanceOf(DomainException);
		expect(exception.message).toBe('EXAMPLE_NOT_FOUND');
		expect(exception.kind).toBe('NOT_FOUND');
		expect(exception.errors).toEqual([]);
	});

	it('should build an EXAMPLE_INVALID_NAME validation exception with the given details', () => {
		const exception = ExampleException.invalidName(['detail']);

		expect(exception).toBeInstanceOf(ExampleException);
		expect(exception).toMatchObject({
			message: 'EXAMPLE_INVALID_NAME',
			kind: 'VALIDATION',
			errors: ['detail'],
		});
	});

	it('should default invalidName errors to an empty array', () => {
		expect(ExampleException.invalidName().errors).toEqual([]);
	});
});
