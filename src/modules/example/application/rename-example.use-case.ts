import type { UseCase } from '../../../shared/application/use-case.js';
import { ExampleException } from '../domain/example.exception.js';
import type { ExampleRepository } from '../domain/example.repository.js';
import { toExampleDto, type ExampleDto } from './example.dto.js';

export interface RenameExampleInput {
	id: string;
	name: string;
}

export class RenameExample implements UseCase<RenameExampleInput, ExampleDto> {
	constructor(private readonly examples: ExampleRepository) {}

	async execute(input: RenameExampleInput): Promise<ExampleDto> {
		const example = await this.examples.findById(input.id);
		if (!example) {
			throw ExampleException.notFound();
		}
		example.rename(input.name, new Date());

		const saved = await this.examples.save(example);
		if (!saved) {
			throw ExampleException.notFound();
		}
		return toExampleDto(saved);
	}
}
