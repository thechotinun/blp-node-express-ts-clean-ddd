import type { Mocked } from 'vitest';
import { DomainException } from '../../../shared/domain/exceptions/domain.exception.js';
import type { IdGenerator } from '../../../shared/domain/id-generator.js';
import type { ExampleRepository } from '../domain/example.repository.js';
import type { Example } from '../domain/example.entity.js';
import { EXAMPLE_ID, mockExampleRepository } from '../testing/example.factory.js';
import { RegisterExample } from './register-example.use-case.js';

describe('RegisterExample', () => {
	let examples: Mocked<ExampleRepository>;
	let useCase: RegisterExample;

	beforeEach(() => {
		examples = mockExampleRepository();
		examples.create.mockImplementation(async (example: Example) => example);
		const ids: IdGenerator = { next: () => EXAMPLE_ID };
		useCase = new RegisterExample(examples, ids);
	});

	it('should create an example with a generated id and return its DTO', async () => {
		const result = await useCase.execute({ name: ' Ann ' });

		expect(examples.create).toHaveBeenCalledOnce();
		expect(examples.create.mock.calls[0]?.[0].id).toBe(EXAMPLE_ID);
		expect(result).toMatchObject({ id: EXAMPLE_ID, name: 'Ann', isActive: true });
	});

	it('should not persist anything when the name is invalid', async () => {
		await expect(useCase.execute({ name: '' })).rejects.toBeInstanceOf(DomainException);
		expect(examples.create).not.toHaveBeenCalled();
	});
});
