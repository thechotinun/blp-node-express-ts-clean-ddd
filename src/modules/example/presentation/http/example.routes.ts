import { Router } from 'express';
import type { ExampleController } from './example.controller.js';

export function exampleRoutes(controller: ExampleController): Router {
	const router = Router();
	router.post('/', controller.register);
	router.get('/', controller.list);
	router.get('/:id', controller.get);
	router.patch('/:id', controller.rename);
	router.delete('/:id', controller.remove);
	return router;
}
