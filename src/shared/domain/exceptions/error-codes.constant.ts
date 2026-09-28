/**
 * Generic, cross-module error codes. Module-specific codes live in each module's
 * `domain/<module>.exception.ts` (each module owns its own range).
 */
export const ErrorCodes: { [key: number]: string } = {
	0: 'UNDEFINED_ERROR',
	900000: 'PROTOTYPE_ERROR',
	900403: 'UNAUTHORIZED',
	900422: 'VALIDATE_ERROR',
	900423: 'BAD_REQUEST',
};
