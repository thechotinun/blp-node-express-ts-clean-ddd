import { AggregateRoot } from '../../../shared/domain/aggregate-root.js';
import { ExampleException } from './example.exception.js';
import { ExampleRegistered } from './example.events.js';

interface ExampleProps {
	name: string;
	isActive: boolean;
	createdDate: Date;
	createdBy: string | null;
	updatedDate: Date;
	updatedBy: string | null;
}

export class Example extends AggregateRoot<ExampleProps> {
	private constructor(id: string, props: ExampleProps) {
		super(id, props);
	}

	/** Create a brand-new example. Enforces invariants and raises domain events. */
	static register(params: { id: string; name: string; now: Date }): Example {
		const example = new Example(params.id, {
			name: Example.validateName(params.name),
			isActive: true,
			createdDate: params.now,
			createdBy: null,
			updatedDate: params.now,
			updatedBy: null,
		});
		example.addDomainEvent(new ExampleRegistered(example.id, params.now));
		return example;
	}

	/** Rebuild an example from persistence. No validation, no events. */
	static reconstitute(id: string, props: ExampleProps): Example {
		return new Example(id, props);
	}

	rename(name: string, now: Date): void {
		this.props.name = Example.validateName(name);
		this.props.updatedDate = now;
	}

	get name(): string {
		return this.props.name;
	}

	get isActive(): boolean {
		return this.props.isActive;
	}

	get createdDate(): Date {
		return this.props.createdDate;
	}

	get createdBy(): string | null {
		return this.props.createdBy;
	}

	get updatedDate(): Date {
		return this.props.updatedDate;
	}

	get updatedBy(): string | null {
		return this.props.updatedBy;
	}

	private static validateName(raw: string): string {
		const name = raw.trim();
		if (name.length < 1 || name.length > 100) {
			throw ExampleException.invalidName(['name: Must be 1-100 characters']);
		}
		return name;
	}
}
