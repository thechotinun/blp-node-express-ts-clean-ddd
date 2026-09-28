import type { PrismaClient } from '../../shared/infrastructure/persistence/prisma/prisma.client.js';
import { createExampleModule } from './index.js';

describe('createExampleModule', () => {
	it('should wire the module into an express router with the CRUD routes', () => {
		const prisma = { example: {} } as unknown as PrismaClient;

		const router = createExampleModule({ prisma, ids: { next: () => 'id' } });
		const routes = router.stack.map((layer) => {
			const route = layer.route as { path: string; methods: Record<string, boolean> } | undefined;

			return `${Object.keys(route?.methods ?? {}).join(',')} ${route?.path}`;
		});

		expect(routes).toEqual(['post /', 'get /', 'get /:id', 'patch /:id', 'delete /:id']);
	});
});
