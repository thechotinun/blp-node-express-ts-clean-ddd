import type { Mocked } from 'vitest';
import type { BaseEntity } from '../entities/base.entity.js';
import { BaseRepository, type PrismaDelegate } from './base.repository.js';

interface TestEntity extends BaseEntity {
	name: string;
}

interface TestDomain {
	id: string;
	name: string;
	mapped: true;
}

const now = new Date('2026-01-01T00:00:00Z');

const row = (id: string, name: string): TestEntity => ({
	id,
	name,
	createdDate: now,
	createdBy: null,
	updatedDate: now,
	updatedBy: null,
	isActive: true,
	deletedDate: null,
	deletedBy: null,
});

class TestRepository extends BaseRepository<TestEntity, TestDomain> {
	protected toDomain(entity: TestEntity): TestDomain {
		return { id: entity.id, name: entity.name, mapped: true };
	}

	protected toPersistence(domain: TestDomain): Partial<TestEntity> {
		return { id: domain.id, name: domain.name };
	}
}

const buildDelegateMock = (): Mocked<PrismaDelegate<TestEntity>> => ({
	findMany: vi.fn(),
	findFirst: vi.fn(),
	count: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	updateMany: vi.fn(),
});

describe('BaseRepository', () => {
	let delegate: Mocked<PrismaDelegate<TestEntity>>;
	let repository: TestRepository;

	beforeEach(() => {
		delegate = buildDelegateMock();
		repository = new TestRepository(delegate);
	});

	describe('findAll', () => {
		it('should return all non-deleted entities mapped to domain', async () => {
			delegate.findMany.mockResolvedValue([row('1', 'a')]);

			const result = await repository.findAll();

			expect(delegate.findMany).toHaveBeenCalledWith({ where: { deletedDate: null } });
			expect(result).toEqual([{ id: '1', name: 'a', mapped: true }]);
		});
	});

	describe('findById', () => {
		it('should return the entity mapped to domain when found', async () => {
			delegate.findFirst.mockResolvedValue(row('1', 'a'));

			const result = await repository.findById('1');

			expect(delegate.findFirst).toHaveBeenCalledWith({ where: { id: '1', deletedDate: null } });
			expect(result).toEqual({ id: '1', name: 'a', mapped: true });
		});

		it('should return null when not found', async () => {
			delegate.findFirst.mockResolvedValue(null);

			const result = await repository.findById('missing');

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should persist the domain object and return it mapped back', async () => {
			delegate.create.mockResolvedValue(row('1', 'a'));

			const result = await repository.create({ id: '1', name: 'a', mapped: true });

			expect(delegate.create).toHaveBeenCalledWith({ data: { id: '1', name: 'a' } });
			expect(result).toEqual({ id: '1', name: 'a', mapped: true });
		});
	});

	describe('update', () => {
		it('should update and return the entity mapped to domain', async () => {
			delegate.count.mockResolvedValue(1);
			delegate.update.mockResolvedValue(row('1', 'new'));

			const result = await repository.update('1', { name: 'new' });

			expect(delegate.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'new' } });
			expect(result).toEqual({ id: '1', name: 'new', mapped: true });
		});

		it('should return null and not update when the entity does not exist', async () => {
			delegate.count.mockResolvedValue(0);

			const result = await repository.update('missing', { name: 'new' });

			expect(result).toBeNull();
			expect(delegate.update).not.toHaveBeenCalled();
		});
	});

	describe('save', () => {
		it('should persist the domain object and return it mapped back', async () => {
			delegate.count.mockResolvedValue(1);
			delegate.update.mockResolvedValue(row('1', 'new'));

			const result = await repository.save({ id: '1', name: 'new', mapped: true });

			expect(delegate.update).toHaveBeenCalledWith({
				where: { id: '1' },
				data: { id: '1', name: 'new' },
			});
			expect(result).toEqual({ id: '1', name: 'new', mapped: true });
		});

		it('should return null and not update when the entity does not exist', async () => {
			delegate.count.mockResolvedValue(0);

			const result = await repository.save({ id: 'missing', name: 'new', mapped: true });

			expect(result).toBeNull();
			expect(delegate.update).not.toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('should soft delete and return true when a row was affected', async () => {
			delegate.updateMany.mockResolvedValue({ count: 1 });

			const result = await repository.delete('1');

			expect(delegate.updateMany).toHaveBeenCalledWith({
				where: { id: '1', deletedDate: null },
				data: { deletedDate: expect.any(Date), deletedBy: null },
			});
			expect(result).toBe(true);
		});

		it('should record who deleted the row when deletedBy is given', async () => {
			delegate.updateMany.mockResolvedValue({ count: 1 });

			await repository.delete('1', 'user-1');

			expect(delegate.updateMany).toHaveBeenCalledWith({
				where: { id: '1', deletedDate: null },
				data: { deletedDate: expect.any(Date), deletedBy: 'user-1' },
			});
		});

		it('should return false when no row was affected', async () => {
			delegate.updateMany.mockResolvedValue({ count: 0 });

			const result = await repository.delete('missing');

			expect(result).toBe(false);
		});
	});

	describe('paginate', () => {
		it('should load one page of non-deleted entities with the total count', async () => {
			delegate.count.mockResolvedValue(25);
			delegate.findMany.mockResolvedValue([row('1', 'a')]);

			const result = await repository.paginate({ page: 2, limit: 10 });

			expect(delegate.count).toHaveBeenCalledWith({ where: { deletedDate: null } });
			expect(delegate.findMany).toHaveBeenCalledWith({
				where: { deletedDate: null },
				skip: 10,
				take: 10,
				orderBy: { createdDate: 'desc' },
			});
			expect(result).toEqual({
				items: [{ id: '1', name: 'a', mapped: true }],
				totalItems: 25,
				page: 2,
				limit: 10,
			});
		});
	});
});
