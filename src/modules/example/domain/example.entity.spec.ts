import { EXAMPLE_ID, FIXED_DATE, exampleFactory } from '../testing/example.factory.js';
import { Example } from './example.entity.js';
import { ExampleRegistered } from './example.events.js';

const later = new Date('2026-02-01T00:00:00.000Z');

const register = (name: string) => Example.register({ id: EXAMPLE_ID, name, now: FIXED_DATE });

const invalidName = expect.objectContaining({ message: 'EXAMPLE_INVALID_NAME' });

describe('Example', () => {
	describe('register', () => {
		it('should create an active example stamped with the given time', () => {
			const example = register('Ann');

			expect(example.id).toBe(EXAMPLE_ID);
			expect(example.name).toBe('Ann');
			expect(example.isActive).toBe(true);
			expect(example.createdDate).toBe(FIXED_DATE);
			expect(example.updatedDate).toBe(FIXED_DATE);
			expect(example.createdBy).toBeNull();
			expect(example.updatedBy).toBeNull();
		});

		it('should trim the name', () => {
			expect(register('  Ann  ').name).toBe('Ann');
		});

		it('should record an ExampleRegistered event', () => {
			const events = register('Ann').pullDomainEvents();

			expect(events).toEqual([new ExampleRegistered(EXAMPLE_ID, FIXED_DATE)]);
			expect(events[0]?.name).toBe('example.registered');
		});

		it('should accept a name of exactly 100 characters', () => {
			expect(register('a'.repeat(100)).name).toHaveLength(100);
		});

		it.each([
			['empty', ''],
			['whitespace only', '   '],
			['longer than 100 characters', 'a'.repeat(101)],
		])('should reject a name that is %s', (_label, name) => {
			expect(() => register(name)).toThrow(invalidName);
		});
	});

	describe('reconstitute', () => {
		it('should not record any events', () => {
			expect(exampleFactory().pullDomainEvents()).toEqual([]);
		});

		it('should not validate stored values', () => {
			expect(exampleFactory({ name: '' }).name).toBe('');
		});
	});

	describe('rename', () => {
		it('should update the name and updatedDate', () => {
			const example = exampleFactory();

			example.rename('  New name ', later);

			expect(example.name).toBe('New name');
			expect(example.updatedDate).toBe(later);
			expect(example.createdDate).toBe(FIXED_DATE);
		});

		it('should reject an invalid name and keep the previous state', () => {
			const example = exampleFactory({ name: 'Old' });

			expect(() => example.rename(' ', later)).toThrow(invalidName);
			expect(example.name).toBe('Old');
			expect(example.updatedDate).toBe(FIXED_DATE);
		});
	});
});
