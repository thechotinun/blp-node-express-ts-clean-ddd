import { Entity } from './entity.js';
import type { DomainEvent } from './domain-event.js';

export abstract class AggregateRoot<TProps> extends Entity<TProps> {
	private domainEvents: DomainEvent[] = [];

	protected addDomainEvent(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	pullDomainEvents(): DomainEvent[] {
		const events = this.domainEvents;
		this.domainEvents = [];

		return events;
	}
}
