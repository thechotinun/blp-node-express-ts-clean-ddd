import type { UseCase } from '../../../shared/application/use-case.js';
import type { IdGenerator } from '../../../shared/domain/id-generator.js';
import { Example } from '../domain/example.entity.js';
import type { ExampleRepository } from '../domain/example.repository.js';
import { toExampleDto, type ExampleDto } from './example.dto.js';

export interface RegisterExampleInput {
	name: string;
}

export class RegisterExample implements UseCase<RegisterExampleInput, ExampleDto> {
	constructor(
		private readonly examples: ExampleRepository,
		private readonly ids: IdGenerator,
	) {}

	async execute(input: RegisterExampleInput): Promise<ExampleDto> {
		const example = Example.register({ id: this.ids.next(), name: input.name, now: new Date() });
		return toExampleDto(await this.examples.create(example));
	}
}
