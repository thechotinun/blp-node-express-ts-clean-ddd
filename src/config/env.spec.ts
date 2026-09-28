describe('env', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it('should expose the validated process environment', async () => {
		vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');
		vi.stubEnv('PORT', '4321');

		const { env } = await import('./env.js');

		expect(env.PORT).toBe(4321);
		expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
	});
});
