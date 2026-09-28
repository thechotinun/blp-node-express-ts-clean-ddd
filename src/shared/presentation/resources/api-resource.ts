import type { Response } from 'express';
import type { PaginationLinks, PaginationMeta } from './paginate.resource.js';
import { HttpStatusMessages } from '../constants/http-status-messages.constant.js';

interface PaginatedData {
	items: unknown[];
	links: PaginationLinks;
	meta: PaginationMeta;
}

function isPaginatedData(data: unknown): data is PaginatedData {
	return typeof data === 'object' && data !== null && 'items' in data;
}

export class ApiResource {
	/**
	 * Success response
	 * @param [data]
	 * @param [statusCode]
	 * @returns SuccessResponseInterface
	 */
	static successResponse(data?: unknown, statusCode = 200): SuccessResponseInterface {
		const status = { code: statusCode, message: HttpStatusMessages[statusCode] ?? '' };

		if (!data) {
			return { status };
		}

		if (isPaginatedData(data)) {
			const { items, links, meta } = data;

			return { data: items, links, meta, status };
		}

		return { data: data as Record<string, unknown> | unknown[], status };
	}

	/**
	 * Sends `data` wrapped as a success response.
	 * @param res
	 * @param [data]
	 * @param [statusCode]
	 */
	static send(res: Response, data?: unknown, statusCode = 200): void {
		res.status(statusCode).json(ApiResource.successResponse(data, statusCode));
	}
}

export interface SuccessResponseInterface {
	status: { code: number; message: string };
	data?: Record<string, unknown> | unknown[];
	links?: PaginationLinks;
	meta?: PaginationMeta;
}
