import type { z } from 'zod';
import { ValidationException } from '../../domain/exceptions/validation.exception.js';

/** Flattens zod issues into `["address.city: Required", ...]`. */
export function flattenZodIssues(issues: z.core.$ZodIssue[]): string[] {
	return issues.map((issue) => {
		const path = issue.path.map(String).join('.');

		return path ? `${path}: ${issue.message}` : issue.message;
	});
}

/** Parses `data` with `schema`, throwing a ValidationException (900422) on failure. */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
	const result = schema.safeParse(data);

	if (!result.success) {
		throw new ValidationException(flattenZodIssues(result.error.issues));
	}

	return result.data;
}

export { ValidationException };
