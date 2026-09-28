import express, { type Express, type Router } from 'express';
import {
	exceptionFilter,
	notFoundHandler,
} from './shared/presentation/filters/exception.filter.js';
import { ApiResource } from './shared/presentation/resources/api-resource.js';

/** Every module is mounted under this prefix: `${API_PREFIX}/<module>`. */
const API_PREFIX = '/api/v1';

/**
 * @param modules routers keyed by module name, e.g. `{ examples: router }` → `/api/v1/examples`
 */
export function createApp(modules: Record<string, Router>): Express {
	const app = express();
	app.use(express.json());

	app.get('/health', (_req, res) => {
		ApiResource.send(res, { status: 'ok' });
	});

	for (const [name, router] of Object.entries(modules)) {
		app.use(`${API_PREFIX}/${name}`, router);
	}

	app.use(notFoundHandler);
	app.use(exceptionFilter);
	return app;
}
