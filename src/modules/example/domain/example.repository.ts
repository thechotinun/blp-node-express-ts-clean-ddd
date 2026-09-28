import type { Page, PageRequest } from '../../../shared/domain/pagination.js';
import type { Example } from './example.entity.js';

export interface ExampleRepository {
	findById(id: string): Promise<Example | null>;
	paginate(request: PageRequest): Promise<Page<Example>>;
	create(example: Example): Promise<Example>;
	save(example: Example): Promise<Example | null>;
	/** Soft delete. Returns false when nothing was deleted. */
	delete(id: string, deletedBy?: string | null): Promise<boolean>;
}
