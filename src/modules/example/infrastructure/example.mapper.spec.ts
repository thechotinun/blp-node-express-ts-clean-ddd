import { exampleRowFactory } from '../testing/example.factory.js';
import { ExampleMapper } from './example.mapper.js';

describe('ExampleMapper', () => {
	it('should map a row to a domain example', () => {
		const row = exampleRowFactory({ name: 'Ann', createdBy: 'user-1', isActive: false });

		const example = ExampleMapper.toDomain(row);

		expect(example.id).toBe(row.id);
		expect(example.name).toBe('Ann');
		expect(example.createdBy).toBe('user-1');
		expect(example.isActive).toBe(false);
		expect(example.createdDate).toBe(row.createdDate);
	});

	it('should round-trip back to the same row, without soft-delete columns', () => {
		const row = exampleRowFactory({ updatedBy: 'user-2' });
		const { deletedDate: _deletedDate, deletedBy: _deletedBy, ...persisted } = row;

		expect(ExampleMapper.toPersistence(ExampleMapper.toDomain(row))).toEqual(persisted);
	});
});
