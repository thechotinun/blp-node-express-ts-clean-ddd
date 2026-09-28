import { UuidGenerator } from './uuid.generator.js';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('UuidGenerator', () => {
	it('should generate a v4 uuid', () => {
		expect(new UuidGenerator().next()).toMatch(UUID_V4);
	});

	it('should generate a different id on each call', () => {
		const ids = new UuidGenerator();

		expect(ids.next()).not.toBe(ids.next());
	});
});
