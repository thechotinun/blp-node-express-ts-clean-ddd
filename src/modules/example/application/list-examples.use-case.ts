import type { UseCase } from '../../../shared/application/use-case.js';
import type { Page, PageRequest } from '../../../shared/domain/pagination.js';
import type { ExampleRepository } from '../domain/example.repository.js';
import { toExampleDto, type ExampleDto } from './example.dto.js';

export class ListExamples implements UseCase<PageRequest, Page<ExampleDto>> {
	constructor(private readonly examples: ExampleRepository) {}

	async execute(input: PageRequest): Promise<Page<ExampleDto>> {
		const page = await this.examples.paginate(input);
		return { ...page, items: page.items.map(toExampleDto) };
	}
}
