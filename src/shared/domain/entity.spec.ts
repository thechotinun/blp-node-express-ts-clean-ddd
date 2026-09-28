import { Entity } from './entity.js';

class TestEntity extends Entity<{ name: string }> {
	constructor(id: string, name: string) {
		super(id, { name });
	}
}

describe('Entity', () => {
	it('should be equal to another entity with the same id', () => {
		expect(new TestEntity('1', 'a').equals(new TestEntity('1', 'b'))).toBe(true);
	});

	it('should not be equal to an entity with a different id', () => {
		expect(new TestEntity('1', 'a').equals(new TestEntity('2', 'a'))).toBe(false);
	});
});
