import { z } from 'zod';
import type { PageRequest } from '../../domain/pagination.js';

const defaultPerPage = () => Number(process.env['PER_PAGE'] ?? 30);

/** `?page=&perPage=` → `{ page, limit }` */
export const paginateQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),
		perPage: z.coerce.number().int().min(1).max(100).optional(),
	})
	.transform(({ page, perPage }): PageRequest => ({
		page,
		limit: perPage ?? defaultPerPage(),
	}));
