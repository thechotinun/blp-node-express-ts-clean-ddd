import type { Example as ExampleRow } from '../../../shared/infrastructure/persistence/prisma/generated/client.js';
import { Example } from '../domain/example.entity.js';

export const ExampleMapper = {
	toDomain(row: ExampleRow): Example {
		return Example.reconstitute(row.id, {
			name: row.name,
			isActive: row.isActive,
			createdDate: row.createdDate,
			createdBy: row.createdBy,
			updatedDate: row.updatedDate,
			updatedBy: row.updatedBy,
		});
	},

	/** deletedDate/deletedBy are owned by the repository (soft delete), so they are not written here. */
	toPersistence(example: Example): Omit<ExampleRow, 'deletedDate' | 'deletedBy'> {
		return {
			id: example.id,
			name: example.name,
			isActive: example.isActive,
			createdDate: example.createdDate,
			createdBy: example.createdBy,
			updatedDate: example.updatedDate,
			updatedBy: example.updatedBy,
		};
	},
};
