import { paginateQuerySchema } from './paginate-query.dto.js';

describe('paginateQuerySchema', () => {
	const originalPerPage = process.env['PER_PAGE'];

	afterEach(() => {
		if (originalPerPage === undefined) {
			delete process.env['PER_PAGE'];
		} else {
			process.env['PER_PAGE'] = originalPerPage;
		}
	});

	it('should default page to 1 and limit to PER_PAGE env var when no params are given', () => {
		process.env['PER_PAGE'] = '15';

		const query = paginateQuerySchema.parse({});

		expect(query.page).toBe(1);
		expect(query.limit).toBe(15);
	});

	it('should fall back to 30 when PER_PAGE env var is not set', () => {
		delete process.env['PER_PAGE'];

		const query = paginateQuerySchema.parse({});

		expect(query.limit).toBe(30);
	});

	it('should transform string query params into numbers', () => {
		process.env['PER_PAGE'] = '10';

		const query = paginateQuerySchema.parse({ page: '3', perPage: '25' });

		expect(query.page).toBe(3);
		expect(query.limit).toBe(25);
	});

	it('should fall back to the PER_PAGE env var when perPage is not provided', () => {
		process.env['PER_PAGE'] = '10';

		const query = paginateQuerySchema.parse({ page: '2' });

		expect(query.page).toBe(2);
		expect(query.limit).toBe(10);
	});

	it('should reject a non-positive page', () => {
		expect(paginateQuerySchema.safeParse({ page: '0' }).success).toBe(false);
	});
});
