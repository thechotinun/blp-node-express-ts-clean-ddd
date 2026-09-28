import { DomainException } from '../../../shared/domain/exceptions/domain.exception.js';

/** Error keys the example module throws; numeric codes live in src/error-codes.registry.ts. */
export type ExampleErrorKey = 'EXAMPLE_NOT_FOUND' | 'EXAMPLE_INVALID_NAME';

export class ExampleException extends DomainException<ExampleErrorKey> {
	static notFound(): ExampleException {
		return new ExampleException('EXAMPLE_NOT_FOUND', 'NOT_FOUND');
	}

	static invalidName(errors: string[] = []): ExampleException {
		return new ExampleException('EXAMPLE_INVALID_NAME', 'VALIDATION', errors);
	}
}
