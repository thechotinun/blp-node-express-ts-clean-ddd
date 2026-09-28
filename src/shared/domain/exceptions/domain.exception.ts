/**
 * What went wrong, in domain terms. The presentation layer decides how each kind
 * is reported (HTTP status etc.) — the domain never knows about transport.
 */
export type DomainErrorKind = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'BUSINESS_RULE';

/**
 * Generic error keys shared by every module. Numeric codes for all keys live in
 * src/error-codes.registry.ts — the domain only knows the key.
 */
export type SharedErrorKey =
	'UNDEFINED_ERROR' | 'PROTOTYPE_ERROR' | 'UNAUTHORIZED' | 'VALIDATE_ERROR' | 'BAD_REQUEST';

export class DomainException<Key extends string = string> extends Error {
	declare readonly message: Key;

	/**
	 * @param message stable error key, e.g. 'THING_NOT_FOUND' (mapped to a numeric code at the edge)
	 * @param kind    category used to pick the transport status
	 * @param errors  human-readable details
	 */
	constructor(
		message: Key,
		public readonly kind: DomainErrorKind,
		public readonly errors: string[] = [],
	) {
		super(message);
		this.name = new.target.name;
	}
}
