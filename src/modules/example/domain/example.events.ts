import type { DomainEvent } from '../../../shared/domain/domain-event.js';

export class ExampleRegistered implements DomainEvent {
	readonly name = 'example.registered';

	constructor(
		readonly aggregateId: string,
		readonly occurredAt: Date,
	) {}
}
