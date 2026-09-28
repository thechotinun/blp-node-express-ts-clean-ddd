import { createApp } from './app.js';
import { env } from './config/env.js';
import { createExampleModule } from './modules/example/index.js';
import { createPrismaClient } from './shared/infrastructure/persistence/prisma/prisma.client.js';
import { UuidGenerator } from './shared/infrastructure/id/uuid.generator.js';

const prisma = createPrismaClient(env.DATABASE_URL);
const ids = new UuidGenerator();

const app = createApp({
	examples: createExampleModule({ prisma, ids }),
});

const server = app.listen(env.PORT, () => {
	console.log(`Server running at http://localhost:${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
	console.log(`${signal} received, shutting down`);
	server.close();
	await prisma.$disconnect();
	process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
