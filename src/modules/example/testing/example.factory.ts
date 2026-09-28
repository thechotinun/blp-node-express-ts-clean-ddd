import type { Mocked } from 'vitest';
import type { Example as ExampleRow } from '../../../shared/infrastructure/persistence/prisma/generated/client.js';
import { Example } from '../domain/example.entity.js';
import type { ExampleRepository } from '../domain/example.repository.js';

export const EXAMPLE_ID = '0b9a4b0e-5b1a-4c55-9c1e-2f6d8f2b7a10';
export const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

type ExampleProps = Parameters<typeof Example.reconstitute>[1];

/** An Example as loaded from persistence (no events). */
export const exampleFactory = (overrides: Partial<ExampleProps & { id: string }> = {}): Example => {
	const { id = EXAMPLE_ID, ...props } = overrides;

	return Example.reconstitute(id, {
		name: 'Example',
		isActive: true,
		createdDate: FIXED_DATE,
		createdBy: null,
		updatedDate: FIXED_DATE,
		updatedBy: null,
		...props,
	});
};

/** A row as returned by Prisma for the `examples` table. */
export const exampleRowFactory = (overrides: Partial<ExampleRow> = {}): ExampleRow => ({
	id: EXAMPLE_ID,
	name: 'Example',
	createdDate: FIXED_DATE,
	createdBy: null,
	updatedDate: FIXED_DATE,
	updatedBy: null,
	isActive: true,
	deletedDate: null,
	deletedBy: null,
	...overrides,
});

export const mockExampleRepository = (): Mocked<ExampleRepository> => ({
	findById: vi.fn(),
	paginate: vi.fn(),
	create: vi.fn(),
	save: vi.fn(),
	delete: vi.fn(),
});
