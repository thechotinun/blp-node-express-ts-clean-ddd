import type { Response } from 'express';
import { ApiResource } from './api-resource.js';

describe('ApiResource', () => {
	describe('successResponse', () => {
		it('should return a bare OK status when no data is given', () => {
			const result = ApiResource.successResponse();

			expect(result).toEqual({ status: { code: 200, message: 'OK' } });
		});

		it('should return data, links and meta for paginated data', () => {
			const paginated = {
				items: [{ id: '1' }],
				links: { first: 'a', previous: '', next: '', last: 'z' },
				meta: { itemCount: 1, itemsPerPage: 10, currentPage: 1 },
			};

			const result = ApiResource.successResponse(paginated);

			expect(result).toEqual({
				data: paginated.items,
				links: paginated.links,
				meta: paginated.meta,
				status: { code: 200, message: 'OK' },
			});
		});

		it('should return plain data without links/meta for non-paginated data', () => {
			const data = { id: '1', name: 'example' };

			const result = ApiResource.successResponse(data);

			expect(result).toEqual({ data, status: { code: 200, message: 'OK' } });
			expect(result.links).toBeUndefined();
			expect(result.meta).toBeUndefined();
		});
	});

	it('should use the given status code', () => {
		const result = ApiResource.successResponse({ id: '1' }, 201);

		expect(result.status).toEqual({ code: 201, message: 'Created' });
	});

	describe('send', () => {
		it('should write the status and the wrapped body', () => {
			const json = vi.fn();
			const status = vi.fn().mockReturnValue({ json });
			const res = { status } as unknown as Response;

			ApiResource.send(res, { id: '1' }, 201);

			expect(status).toHaveBeenCalledWith(201);
			expect(json).toHaveBeenCalledWith({
				data: { id: '1' },
				status: { code: 201, message: 'Created' },
			});
		});
	});
});
