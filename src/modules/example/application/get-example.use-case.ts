import type { UseCase } from '../../../shared/application/use-case.js';
import { ExampleException } from '../domain/example.exception.js';
import type { ExampleRepository } from '../domain/example.repository.js';
import { toExampleDto, type ExampleDto } from './example.dto.js';

export class GetExample implements UseCase<{ id: string }, ExampleDto> {
	constructor(private readonly examples: ExampleRepository) {}

	async execute(input: { id: string }): Promise<ExampleDto> {
		const example = await this.examples.findById(input.id);
		if (!example) {
			throw ExampleException.notFound();
		}
		return toExampleDto(example);
	}
}
