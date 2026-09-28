import { AggregateRoot } from './aggregate-root.js';
import type { DomainEvent } from './domain-event.js';

const event = (name: string): DomainEvent => ({
	name,
	aggregateId: 'agg-1',
	occurredAt: new Date('2026-01-01T00:00:00.000Z'),
});

class TestAggregate extends AggregateRoot<{ value: number }> {
	constructor(id: string) {
		super(id, { value: 0 });
	}

	raise(name: string): void {
		this.addDomainEvent(event(name));
	}
}

describe('AggregateRoot', () => {
	it('should start with no events', () => {
		expect(new TestAggregate('agg-1').pullDomainEvents()).toEqual([]);
	});

	it('should return raised events in order', () => {
		const aggregate = new TestAggregate('agg-1');
		aggregate.raise('first');
		aggregate.raise('second');

		expect(aggregate.pullDomainEvents().map((e) => e.name)).toEqual(['first', 'second']);
	});

	it('should clear events once pulled', () => {
		const aggregate = new TestAggregate('agg-1');
		aggregate.raise('first');
		aggregate.pullDomainEvents();

		expect(aggregate.pullDomainEvents()).toEqual([]);
	});
});
