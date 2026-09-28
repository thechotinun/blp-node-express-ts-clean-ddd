import { DomainException } from '../../../shared/domain/exceptions/domain.exception.js';

/** Error codes owned by the example module (1001xx). */
export const ExampleErrorCode = {
	NOT_FOUND: 100101,
	INVALID_NAME: 100106,
} as const;

export class ExampleException extends DomainException {
	static notFound(): ExampleException {
		return new ExampleException(ExampleErrorCode.NOT_FOUND, 'EXAMPLE_NOT_FOUND', 'NOT_FOUND');
	}

	static invalidName(errors: string[] = []): ExampleException {
		return new ExampleException(
			ExampleErrorCode.INVALID_NAME,
			'EXAMPLE_INVALID_NAME',
			'VALIDATION',
			errors,
		);
	}
}
