import type { Request, Response } from 'express';
import { paginateQuerySchema } from '../../../../shared/presentation/dto/paginate-query.dto.js';
import { validate } from '../../../../shared/presentation/filters/validation.exception.js';
import { ApiResource } from '../../../../shared/presentation/resources/api-resource.js';
import { toPaginated } from '../../../../shared/presentation/resources/paginate.resource.js';
import type { DeleteExample } from '../../application/delete-example.use-case.js';
import type { GetExample } from '../../application/get-example.use-case.js';
import type { ListExamples } from '../../application/list-examples.use-case.js';
import type { RegisterExample } from '../../application/register-example.use-case.js';
import type { RenameExample } from '../../application/rename-example.use-case.js';
import { exampleIdParams, registerExampleBody, renameExampleBody } from './example.schemas.js';

export interface ExampleUseCases {
	registerExample: RegisterExample;
	getExample: GetExample;
	listExamples: ListExamples;
	renameExample: RenameExample;
	deleteExample: DeleteExample;
}

export class ExampleController {
	constructor(private readonly useCases: ExampleUseCases) {}

	register = async (req: Request, res: Response): Promise<void> => {
		const body = validate(registerExampleBody, req.body);
		ApiResource.send(res, await this.useCases.registerExample.execute(body), 201);
	};

	get = async (req: Request, res: Response): Promise<void> => {
		const { id } = validate(exampleIdParams, req.params);
		ApiResource.send(res, await this.useCases.getExample.execute({ id }));
	};

	list = async (req: Request, res: Response): Promise<void> => {
		const request = validate(paginateQuerySchema, req.query);
		const page = await this.useCases.listExamples.execute(request);
		const route = `${req.baseUrl}${req.path === '/' ? '' : req.path}`;
		ApiResource.send(res, toPaginated(page, route));
	};

	rename = async (req: Request, res: Response): Promise<void> => {
		const { id } = validate(exampleIdParams, req.params);
		const { name } = validate(renameExampleBody, req.body);
		ApiResource.send(res, await this.useCases.renameExample.execute({ id, name }));
	};

	remove = async (req: Request, res: Response): Promise<void> => {
		const { id } = validate(exampleIdParams, req.params);
		await this.useCases.deleteExample.execute({ id });
		ApiResource.send(res);
	};
}
