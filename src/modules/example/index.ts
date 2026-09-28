import type { Router } from 'express';
import type { IdGenerator } from '../../shared/domain/id-generator.js';
import type { PrismaClient } from '../../shared/infrastructure/persistence/prisma/prisma.client.js';
import { DeleteExample } from './application/delete-example.use-case.js';
import { GetExample } from './application/get-example.use-case.js';
import { ListExamples } from './application/list-examples.use-case.js';
import { RegisterExample } from './application/register-example.use-case.js';
import { RenameExample } from './application/rename-example.use-case.js';
import { PrismaExampleRepository } from './infrastructure/prisma-example.repository.js';
import { ExampleController } from './presentation/http/example.controller.js';
import { exampleRoutes } from './presentation/http/example.routes.js';

/** Wires the example module. The only place in the module that knows concrete classes. */
export function createExampleModule(deps: { prisma: PrismaClient; ids: IdGenerator }): Router {
	const examples = new PrismaExampleRepository(deps.prisma);
	const controller = new ExampleController({
		registerExample: new RegisterExample(examples, deps.ids),
		getExample: new GetExample(examples),
		listExamples: new ListExamples(examples),
		renameExample: new RenameExample(examples),
		deleteExample: new DeleteExample(examples),
	});
	return exampleRoutes(controller);
}
