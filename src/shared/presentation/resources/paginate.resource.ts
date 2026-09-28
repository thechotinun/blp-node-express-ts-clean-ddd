import type { Page } from '../../domain/pagination.js';

export interface PaginationMeta {
	itemCount: number;
	totalItems?: number;
	itemsPerPage: number;
	totalPages?: number;
	currentPage: number;
}

export interface PaginationLinks {
	first?: string;
	previous?: string;
	next?: string;
	last?: string;
}

export interface Paginated<T> {
	items: T[];
	meta: PaginationMeta;
	links: PaginationLinks;
}

/**
 * Turns a domain Page into the paginated response shape.
 * @param page  result from a use case
 * @param route path the links point at, e.g. `/api/v1/examples`; omit for no links
 */
export function toPaginated<T>(page: Page<T>, route?: string): Paginated<T> {
	const totalPages = Math.ceil(page.totalItems / page.limit);

	return {
		items: page.items,
		meta: {
			itemCount: page.items.length,
			totalItems: page.totalItems,
			itemsPerPage: page.limit,
			totalPages,
			currentPage: page.page,
		},
		links: route ? buildLinks(route, page, totalPages) : {},
	};
}

function buildLinks(route: string, page: Page<unknown>, totalPages: number): PaginationLinks {
	const link = (n: number) => `${route}?page=${n}&perPage=${page.limit}`;

	return {
		first: link(1),
		previous: page.page > 1 ? link(page.page - 1) : '',
		next: page.page < totalPages ? link(page.page + 1) : '',
		last: totalPages > 0 ? link(totalPages) : '',
	};
}
