import { ZodError } from 'zod';
import { parseEnv } from './env.schema.js';

const DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

describe('parseEnv', () => {
	it('should apply defaults for NODE_ENV and PORT', () => {
		const env = parseEnv({ DATABASE_URL });

		expect(env).toEqual({ NODE_ENV: 'development', PORT: 3000, DATABASE_URL });
	});

	it('should coerce PORT from a string', () => {
		expect(parseEnv({ DATABASE_URL, PORT: '8080' }).PORT).toBe(8080);
	});

	it('should throw when DATABASE_URL is missing', () => {
		expect(() => parseEnv({})).toThrow(ZodError);
	});

	it('should throw when DATABASE_URL is not a URL', () => {
		expect(() => parseEnv({ DATABASE_URL: 'not-a-url' })).toThrow(ZodError);
	});

	it('should throw when NODE_ENV is unknown', () => {
		expect(() => parseEnv({ DATABASE_URL, NODE_ENV: 'staging' })).toThrow(ZodError);
	});
});
