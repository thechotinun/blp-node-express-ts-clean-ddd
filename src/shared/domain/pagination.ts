/** Which slice of a collection to load. */
export interface PageRequest {
	page: number;
	limit: number;
}

/** One slice of a collection plus the total size — no presentation concerns (URLs, meta). */
export interface Page<T> {
	items: T[];
	totalItems: number;
	page: number;
	limit: number;
}
