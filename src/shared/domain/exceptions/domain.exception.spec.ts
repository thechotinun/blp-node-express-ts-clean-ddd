import { DomainException } from './domain.exception.js';

describe('DomainException', () => {
	it('should carry its key, kind and details', () => {
		const exception = new DomainException('THING_NOT_FOUND', 'NOT_FOUND', ['detail']);

		expect(exception.message).toBe('THING_NOT_FOUND');
		expect(exception.kind).toBe('NOT_FOUND');
		expect(exception.errors).toEqual(['detail']);
		expect(exception.name).toBe('DomainException');
	});

	it('should default errors to an empty array', () => {
		expect(new DomainException('X', 'CONFLICT').errors).toEqual([]);
	});

	it('should be an instance of Error', () => {
		expect(new DomainException('X', 'CONFLICT')).toBeInstanceOf(Error);
	});

	it('should not expose any transport (HTTP) status', () => {
		expect(new DomainException('X', 'CONFLICT')).not.toHaveProperty('httpStatus');
	});
});
