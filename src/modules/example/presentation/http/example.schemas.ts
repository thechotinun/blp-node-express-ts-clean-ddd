import { z } from 'zod';

export const exampleIdParams = z.object({ id: z.uuid() });

export const registerExampleBody = z.object({
	name: z.string(),
});

export const renameExampleBody = z.object({
	name: z.string(),
});
