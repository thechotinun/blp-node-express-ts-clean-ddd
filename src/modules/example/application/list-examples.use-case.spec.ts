import { exampleFactory, mockExampleRepository } from '../testing/example.factory.js';
import { ListExamples } from './list-examples.use-case.js';

describe('ListExamples', () => {
	it('should map items to DTOs and keep the paging info', async () => {
		const examples = mockExampleRepository();
		examples.paginate.mockResolvedValue({
			items: [exampleFactory({ name: 'Ann' })],
			totalItems: 11,
			page: 2,
			limit: 10,
		});

		const result = await new ListExamples(examples).execute({ page: 2, limit: 10 });

		expect(examples.paginate).toHaveBeenCalledWith({ page: 2, limit: 10 });
		expect(result).toMatchObject({ totalItems: 11, page: 2, limit: 10 });
		expect(result.items).toEqual([expect.objectContaining({ name: 'Ann' })]);
		expect(typeof result.items[0]?.createdDate).toBe('string');
	});
});
