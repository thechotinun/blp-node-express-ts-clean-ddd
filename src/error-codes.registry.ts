/**
 * Single catalog of API error codes: `{ code: key }`. Modules only throw keys.
 * - A duplicate code fails to compile (TS1117).
 * - A key thrown but not listed here is sent as 900001 UNREGISTERED_ERROR_KEY and logged
 *   with console.warn — add it to this table.
 * - A key listed twice is allowed; `resolveErrorKey` then returns the higher code.
 * Ranges: 0 / 900xxx shared, one block of 100 per module (1001xx example).
 */
export const ErrorCodes = {
	0: 'UNDEFINED_ERROR',
	900000: 'PROTOTYPE_ERROR',
	900001: 'UNREGISTERED_ERROR_KEY',
	900403: 'UNAUTHORIZED',
	900422: 'VALIDATE_ERROR',
	900423: 'BAD_REQUEST',
	// example 1001xx
	100101: 'EXAMPLE_NOT_FOUND',
	100106: 'EXAMPLE_INVALID_NAME',
} as const satisfies Record<number, string>;

const codeByKey = new Map<string, number>(
	Object.entries(ErrorCodes).map(([code, key]) => [key, Number(code)]),
);

/**
 * Code and message to send for an error key. A key missing from `ErrorCodes` is sent
 * as 900001 UNREGISTERED_ERROR_KEY and logged, so it is easy to spot and add.
 */
export function resolveErrorKey(key: string): { code: number; message: string } {
	const code = codeByKey.get(key);

	if (code === undefined) {
		// oxlint-disable-next-line no-console -- no logger yet; a missing catalog entry must surface
		console.warn(`Error key '${key}' has no code in src/error-codes.registry.ts`);
		return { code: 900001, message: ErrorCodes[900001] };
	}

	return { code, message: key };
}
