import type { BaseDto } from '../../../shared/application/base.dto.js';
import type { Example } from '../domain/example.entity.js';

export interface ExampleDto extends BaseDto {
	name: string;
}

export function toExampleDto(example: Example): ExampleDto {
	return {
		id: example.id,
		name: example.name,
		isActive: example.isActive,
		createdDate: example.createdDate.toISOString(),
		createdBy: example.createdBy,
		updatedDate: example.updatedDate.toISOString(),
		updatedBy: example.updatedBy,
	};
}
