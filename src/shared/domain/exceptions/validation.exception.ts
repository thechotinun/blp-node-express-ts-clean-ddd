import { DomainException } from './domain.exception.js';

export class ValidationException extends DomainException {
	constructor(errors: string[] = []) {
		super(900422, 'VALIDATE_ERROR', 'VALIDATION', errors);
	}
}
