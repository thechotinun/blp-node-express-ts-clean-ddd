import { BaseRepository } from '../../../shared/infrastructure/persistence/repositories/base.repository.js';
import type { PrismaClient } from '../../../shared/infrastructure/persistence/prisma/prisma.client.js';
import type { Example as ExampleRow } from '../../../shared/infrastructure/persistence/prisma/generated/client.js';
import type { Example } from '../domain/example.entity.js';
import type { ExampleRepository } from '../domain/example.repository.js';
import { ExampleMapper } from './example.mapper.js';

export class PrismaExampleRepository
	extends BaseRepository<ExampleRow, Example>
	implements ExampleRepository
{
	constructor(prisma: PrismaClient) {
		super(prisma.example);
	}

	protected toDomain(row: ExampleRow): Example {
		return ExampleMapper.toDomain(row);
	}

	protected toPersistence(example: Example): Partial<ExampleRow> {
		return ExampleMapper.toPersistence(example);
	}
}
