import { DomainException } from './domain.exception.js';

export class ValidationException extends DomainException<'VALIDATE_ERROR'> {
	constructor(errors: string[] = []) {
		super('VALIDATE_ERROR', 'VALIDATION', errors);
	}
}
