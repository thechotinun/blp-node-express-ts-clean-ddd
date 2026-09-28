import { exampleFactory } from '../testing/example.factory.js';
import { toExampleDto } from './example.dto.js';

describe('toExampleDto', () => {
	it('should expose base fields and serialize dates as ISO strings', () => {
		const example = exampleFactory({ name: 'Ann', createdBy: 'user-1' });

		expect(toExampleDto(example)).toEqual({
			id: example.id,
			name: 'Ann',
			isActive: true,
			createdDate: '2026-01-01T00:00:00.000Z',
			createdBy: 'user-1',
			updatedDate: '2026-01-01T00:00:00.000Z',
			updatedBy: null,
		});
	});
});
