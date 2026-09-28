import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../../../../app.js';
import { ExampleException } from '../../domain/example.exception.js';
import { toExampleDto } from '../../application/example.dto.js';
import { EXAMPLE_ID, exampleFactory } from '../../testing/example.factory.js';
import { ExampleController, type ExampleUseCases } from './example.controller.js';
import { exampleRoutes } from './example.routes.js';

const useCases = {
	registerExample: { execute: vi.fn() },
	getExample: { execute: vi.fn() },
	listExamples: { execute: vi.fn() },
	renameExample: { execute: vi.fn() },
	deleteExample: { execute: vi.fn() },
};

const dto = toExampleDto(exampleFactory({ name: 'Ann' }));
const OK = { code: 200, message: 'OK' };

let server: Server;
let baseUrl: string;

const request = (method: string, path: string, body?: string) =>
	fetch(`${baseUrl}${path}`, {
		method,
		headers: body === undefined ? {} : { 'content-type': 'application/json' },
		...(body === undefined ? {} : { body }),
	});

beforeAll(async () => {
	const controller = new ExampleController(useCases as unknown as ExampleUseCases);
	const app = createApp({ examples: exampleRoutes(controller) });
	server = app.listen(0);
	await new Promise((resolve) => server.once('listening', resolve));
	baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
	await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
	vi.clearAllMocks();
});

describe('Example HTTP API', () => {
	describe('POST /api/v1/examples', () => {
		it('should respond 201 with the created example', async () => {
			useCases.registerExample.execute.mockResolvedValue(dto);

			const res = await request('POST', '/api/v1/examples', JSON.stringify({ name: 'Ann' }));

			expect(res.status).toBe(201);
			expect(await res.json()).toEqual({ data: dto, status: { code: 201, message: 'Created' } });
			expect(useCases.registerExample.execute).toHaveBeenCalledWith({ name: 'Ann' });
		});

		it('should respond 422 VALIDATE_ERROR when name is missing', async () => {
			const res = await request('POST', '/api/v1/examples', '{}');

			expect(res.status).toBe(422);
			expect(await res.json()).toMatchObject({
				error: { code: 900422, message: 'VALIDATE_ERROR' },
			});
			expect(useCases.registerExample.execute).not.toHaveBeenCalled();
		});

		it('should respond 400 BAD_REQUEST for malformed JSON', async () => {
			const res = await request('POST', '/api/v1/examples', '{bad');

			expect(res.status).toBe(400);
			expect(await res.json()).toMatchObject({ error: { code: 900423, message: 'BAD_REQUEST' } });
		});
	});

	describe('GET /api/v1/examples', () => {
		it('should pass page and perPage to the use case and build meta and links', async () => {
			useCases.listExamples.execute.mockResolvedValue({
				items: [dto],
				totalItems: 6,
				page: 2,
				limit: 5,
			});

			const res = await request('GET', '/api/v1/examples?page=2&perPage=5');

			expect(useCases.listExamples.execute).toHaveBeenCalledWith({ page: 2, limit: 5 });
			expect(await res.json()).toEqual({
				data: [dto],
				meta: { itemCount: 1, totalItems: 6, itemsPerPage: 5, totalPages: 2, currentPage: 2 },
				links: {
					first: '/api/v1/examples?page=1&perPage=5',
					previous: '/api/v1/examples?page=1&perPage=5',
					next: '',
					last: '/api/v1/examples?page=2&perPage=5',
				},
				status: OK,
			});
		});

		it('should respond 422 for a non-numeric page', async () => {
			const res = await request('GET', '/api/v1/examples?page=abc');

			expect(res.status).toBe(422);
		});
	});

	describe('GET /api/v1/examples/:id', () => {
		it('should respond 200 with the example', async () => {
			useCases.getExample.execute.mockResolvedValue(dto);

			const res = await request('GET', `/api/v1/examples/${EXAMPLE_ID}`);

			expect(await res.json()).toEqual({ data: dto, status: OK });
			expect(useCases.getExample.execute).toHaveBeenCalledWith({ id: EXAMPLE_ID });
		});

		it('should respond 422 without calling the use case when id is not a uuid', async () => {
			const res = await request('GET', '/api/v1/examples/not-a-uuid');

			expect(res.status).toBe(422);
			expect(useCases.getExample.execute).not.toHaveBeenCalled();
		});

		it('should respond 404 with EXAMPLE_NOT_FOUND when missing', async () => {
			useCases.getExample.execute.mockRejectedValue(ExampleException.notFound());

			const res = await request('GET', `/api/v1/examples/${EXAMPLE_ID}`);

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({
				status: { code: 404, message: 'Not Found' },
				error: { code: 100101, message: 'EXAMPLE_NOT_FOUND', errors: [] },
			});
		});
	});

	describe('PATCH /api/v1/examples/:id', () => {
		it('should rename and respond 200', async () => {
			useCases.renameExample.execute.mockResolvedValue({ ...dto, name: 'Anna' });

			const res = await request(
				'PATCH',
				`/api/v1/examples/${EXAMPLE_ID}`,
				JSON.stringify({ name: 'Anna' }),
			);

			expect(res.status).toBe(200);
			expect(useCases.renameExample.execute).toHaveBeenCalledWith({ id: EXAMPLE_ID, name: 'Anna' });
		});
	});

	describe('DELETE /api/v1/examples/:id', () => {
		it('should delete and respond 200 with a bare status', async () => {
			useCases.deleteExample.execute.mockResolvedValue(undefined);

			const res = await request('DELETE', `/api/v1/examples/${EXAMPLE_ID}`);

			expect(await res.json()).toEqual({ status: OK });
			expect(useCases.deleteExample.execute).toHaveBeenCalledWith({ id: EXAMPLE_ID });
		});
	});

	describe('app', () => {
		it('should respond 200 on /health', async () => {
			const res = await request('GET', '/health');

			expect(await res.json()).toEqual({ data: { status: 'ok' }, status: OK });
		});

		it('should not serve modules without the /api/v1 prefix', async () => {
			const res = await request('GET', '/api/examples');

			expect(res.status).toBe(404);
		});

		it('should respond 404 for an unknown route', async () => {
			const res = await request('GET', '/nope');

			expect(res.status).toBe(404);
		});
	});
});
