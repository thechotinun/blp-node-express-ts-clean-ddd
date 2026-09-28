import { ValueObject } from './value-object.js';

class Money extends ValueObject<{ amount: number; currency: string }> {
	constructor(amount: number, currency: string) {
		super({ amount, currency });
	}
}

describe('ValueObject', () => {
	it('should be equal to another value object with the same values', () => {
		expect(new Money(10, 'THB').equals(new Money(10, 'THB'))).toBe(true);
	});

	it('should not be equal when any value differs', () => {
		expect(new Money(10, 'THB').equals(new Money(10, 'USD'))).toBe(false);
	});
});
