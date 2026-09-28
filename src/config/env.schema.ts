import { z } from 'zod';

export const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(3000),
	DATABASE_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

/** Validates raw environment variables; throws a ZodError listing every invalid key. */
export function parseEnv(source: Record<string, string | undefined>): Env {
	return envSchema.parse(source);
}
