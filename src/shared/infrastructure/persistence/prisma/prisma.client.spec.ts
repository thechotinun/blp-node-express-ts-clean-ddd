import { createPrismaClient } from './prisma.client.js';

describe('createPrismaClient', () => {
	it('should build a client without connecting', async () => {
		const prisma = createPrismaClient('postgresql://user:pass@localhost:5432/db');

		expect(prisma.example).toBeDefined();
		await prisma.$disconnect();
	});
});
