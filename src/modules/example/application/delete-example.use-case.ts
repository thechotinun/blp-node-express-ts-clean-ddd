import type { UseCase } from '../../../shared/application/use-case.js';
import { ExampleException } from '../domain/example.exception.js';
import type { ExampleRepository } from '../domain/example.repository.js';

export class DeleteExample implements UseCase<{ id: string }, void> {
	constructor(private readonly examples: ExampleRepository) {}

	async execute(input: { id: string }): Promise<void> {
		if (!(await this.examples.delete(input.id))) {
			throw ExampleException.notFound();
		}
	}
}
