import type { Mocked } from 'vitest';
import type { ExampleRepository } from '../domain/example.repository.js';
import { EXAMPLE_ID, exampleFactory, mockExampleRepository } from '../testing/example.factory.js';
import { GetExample } from './get-example.use-case.js';

describe('GetExample', () => {
	let examples: Mocked<ExampleRepository>;
	let useCase: GetExample;

	beforeEach(() => {
		examples = mockExampleRepository();
		useCase = new GetExample(examples);
	});

	it('should return the example DTO when found', async () => {
		examples.findById.mockResolvedValue(exampleFactory({ name: 'Ann' }));

		const result = await useCase.execute({ id: EXAMPLE_ID });

		expect(examples.findById).toHaveBeenCalledWith(EXAMPLE_ID);
		expect(result).toMatchObject({ id: EXAMPLE_ID, name: 'Ann' });
	});

	it('should throw EXAMPLE_NOT_FOUND when missing', async () => {
		examples.findById.mockResolvedValue(null);

		await expect(useCase.execute({ id: EXAMPLE_ID })).rejects.toMatchObject({
			message: 'EXAMPLE_NOT_FOUND',
		});
	});
});
