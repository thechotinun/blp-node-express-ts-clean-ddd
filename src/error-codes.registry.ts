/**
 * Error-code block reservations. Each module owns one block of 100 codes:
 * block 1001 → codes 100100–100199.
 *
 * Reserve a block here (keyed by the module folder name under src/modules) before
 * defining `<Name>ErrorCode` in `modules/<name>/domain/<name>.exception.ts`.
 * A block may be reserved ahead of the module existing.
 *
 * Generic codes (0, 900xxx) belong to shared `ErrorCodes` and cannot be reserved.
 * Enforced by src/error-codes.spec.ts.
 */
export const ErrorCodeRegistry: Readonly<Record<string, number>> = {
	example: 1001,
};
