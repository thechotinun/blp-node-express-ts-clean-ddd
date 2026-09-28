import { toPaginated } from './paginate.resource.js';

const page = (overrides: Partial<{ totalItems: number; page: number; limit: number }> = {}) => ({
	items: ['a'],
	totalItems: 25,
	page: 2,
	limit: 10,
	...overrides,
});

describe('toPaginated', () => {
	it('should compute meta from the page', () => {
		expect(toPaginated(page()).meta).toEqual({
			itemCount: 1,
			totalItems: 25,
			itemsPerPage: 10,
			totalPages: 3,
			currentPage: 2,
		});
	});

	it('should keep the items as-is', () => {
		expect(toPaginated(page()).items).toEqual(['a']);
	});

	it('should build links with page and perPage for a middle page', () => {
		expect(toPaginated(page(), '/api/test').links).toEqual({
			first: '/api/test?page=1&perPage=10',
			previous: '/api/test?page=1&perPage=10',
			next: '/api/test?page=3&perPage=10',
			last: '/api/test?page=3&perPage=10',
		});
	});

	it('should leave previous empty on the first page and next empty on the last', () => {
		expect(toPaginated(page({ page: 1, totalItems: 5 }), '/api/test').links).toEqual({
			first: '/api/test?page=1&perPage=10',
			previous: '',
			next: '',
			last: '/api/test?page=1&perPage=10',
		});
	});

	it('should report zero pages and no last link for an empty collection', () => {
		const result = toPaginated({ items: [], totalItems: 0, page: 1, limit: 10 }, '/api/test');

		expect(result.meta.totalPages).toBe(0);
		expect(result.links.last).toBe('');
	});

	it('should return empty links when no route is given', () => {
		expect(toPaginated(page()).links).toEqual({});
	});
});
