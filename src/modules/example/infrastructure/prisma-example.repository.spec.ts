import type { PrismaClient } from '../../../shared/infrastructure/persistence/prisma/prisma.client.js';
import { Example } from '../domain/example.entity.js';
import { EXAMPLE_ID, exampleFactory, exampleRowFactory } from '../testing/example.factory.js';
import { PrismaExampleRepository } from './prisma-example.repository.js';

const buildPrisma = () => {
	const example = {
		findMany: vi.fn(),
		findFirst: vi.fn(),
		count: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
	};

	return { example, prisma: { example } as unknown as PrismaClient };
};

describe('PrismaExampleRepository', () => {
	it('should query prisma.example and map rows to Example', async () => {
		const { example, prisma } = buildPrisma();
		example.findFirst.mockResolvedValue(exampleRowFactory({ name: 'Ann' }));

		const result = await new PrismaExampleRepository(prisma).findById(EXAMPLE_ID);

		expect(example.findFirst).toHaveBeenCalledWith({
			where: { id: EXAMPLE_ID, deletedDate: null },
		});
		expect(result).toBeInstanceOf(Example);
		expect(result?.name).toBe('Ann');
	});

	it('should write the mapped example on create', async () => {
		const { example, prisma } = buildPrisma();
		const row = exampleRowFactory({ name: 'Ann' });
		example.create.mockResolvedValue(row);

		await new PrismaExampleRepository(prisma).create(exampleFactory({ name: 'Ann' }));

		const { deletedDate: _deletedDate, deletedBy: _deletedBy, ...data } = row;
		expect(example.create).toHaveBeenCalledWith({ data });
	});
});
