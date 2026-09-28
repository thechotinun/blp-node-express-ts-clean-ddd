/**
 * What went wrong, in domain terms. The presentation layer decides how each kind
 * is reported (HTTP status etc.) — the domain never knows about transport.
 */
export type DomainErrorKind = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'BUSINESS_RULE';

export class DomainException extends Error {
	/**
	 * @param errorCode numeric code clients can rely on, e.g. 990001
	 * @param message   stable code name, e.g. 'THING_NOT_FOUND'
	 * @param kind      category used to pick the transport status
	 * @param errors    human-readable details
	 */
	constructor(
		public readonly errorCode: number,
		message: string,
		public readonly kind: DomainErrorKind,
		public readonly errors: string[] = [],
	) {
		super(message);
		this.name = new.target.name;
	}
}
