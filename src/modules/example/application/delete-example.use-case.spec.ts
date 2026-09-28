import { EXAMPLE_ID, mockExampleRepository } from '../testing/example.factory.js';
import { DeleteExample } from './delete-example.use-case.js';

describe('DeleteExample', () => {
	it('should soft delete the example', async () => {
		const examples = mockExampleRepository();
		examples.delete.mockResolvedValue(true);

		await expect(new DeleteExample(examples).execute({ id: EXAMPLE_ID })).resolves.toBeUndefined();
		expect(examples.delete).toHaveBeenCalledWith(EXAMPLE_ID);
	});

	it('should throw EXAMPLE_NOT_FOUND when nothing was deleted', async () => {
		const examples = mockExampleRepository();
		examples.delete.mockResolvedValue(false);

		await expect(new DeleteExample(examples).execute({ id: EXAMPLE_ID })).rejects.toMatchObject({
			message: 'EXAMPLE_NOT_FOUND',
		});
	});
});
