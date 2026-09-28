import { ExampleErrorCode } from '../domain/example.exception.js';
import type { Mocked } from 'vitest';
import type { Example } from '../domain/example.entity.js';
import type { ExampleRepository } from '../domain/example.repository.js';
import { EXAMPLE_ID, exampleFactory, mockExampleRepository } from '../testing/example.factory.js';
import { RenameExample } from './rename-example.use-case.js';

describe('RenameExample', () => {
	let examples: Mocked<ExampleRepository>;
	let useCase: RenameExample;

	beforeEach(() => {
		examples = mockExampleRepository();
		useCase = new RenameExample(examples);
	});

	it('should save the renamed example and return its DTO', async () => {
		examples.findById.mockResolvedValue(exampleFactory({ name: 'Old' }));
		examples.save.mockImplementation(async (example: Example) => example);

		const result = await useCase.execute({ id: EXAMPLE_ID, name: 'New' });

		expect(examples.save.mock.calls[0]?.[0].name).toBe('New');
		expect(result.name).toBe('New');
	});

	it('should throw EXAMPLE_NOT_FOUND when the example does not exist', async () => {
		examples.findById.mockResolvedValue(null);

		await expect(useCase.execute({ id: EXAMPLE_ID, name: 'New' })).rejects.toMatchObject({
			errorCode: ExampleErrorCode.NOT_FOUND,
		});
		expect(examples.save).not.toHaveBeenCalled();
	});

	it('should throw EXAMPLE_NOT_FOUND when the example vanished before saving', async () => {
		examples.findById.mockResolvedValue(exampleFactory());
		examples.save.mockResolvedValue(null);

		await expect(useCase.execute({ id: EXAMPLE_ID, name: 'New' })).rejects.toMatchObject({
			errorCode: ExampleErrorCode.NOT_FOUND,
		});
	});

	it('should throw EXAMPLE_INVALID_NAME and not save when the name is invalid', async () => {
		examples.findById.mockResolvedValue(exampleFactory());

		await expect(useCase.execute({ id: EXAMPLE_ID, name: ' ' })).rejects.toMatchObject({
			errorCode: ExampleErrorCode.INVALID_NAME,
		});
		expect(examples.save).not.toHaveBeenCalled();
	});
});
