import type { Page, PageRequest } from '../../../domain/pagination.js';
import type { BaseEntity } from '../entities/base.entity.js';

/**
 * The subset of a Prisma model delegate (e.g. `prisma.example`) that BaseRepository uses.
 * Args are loose on purpose: Prisma's generated generics don't compose across models.
 */
export interface PrismaDelegate<Entity> {
	findMany(args: object): Promise<Entity[]>;
	findFirst(args: object): Promise<Entity | null>;
	count(args: object): Promise<number>;
	create(args: { data: object }): Promise<Entity>;
	update(args: { where: { id: string }; data: object }): Promise<Entity>;
	updateMany(args: { where: object; data: object }): Promise<{ count: number }>;
}

const notDeleted = { deletedDate: null };

export abstract class BaseRepository<Entity extends BaseEntity, Domain extends { id: string }> {
	constructor(protected readonly delegate: PrismaDelegate<Entity>) {}

	protected abstract toDomain(entity: Entity): Domain;
	protected abstract toPersistence(domain: Domain): Partial<Entity>;

	async findAll(): Promise<Domain[]> {
		const entities = await this.delegate.findMany({ where: notDeleted });

		return entities.map((entity) => this.toDomain(entity));
	}

	async findById(id: string): Promise<Domain | null> {
		const entity = await this.delegate.findFirst({ where: { id, ...notDeleted } });

		return entity ? this.toDomain(entity) : null;
	}

	async create(domain: Domain): Promise<Domain> {
		const saved = await this.delegate.create({ data: this.toPersistence(domain) });

		return this.toDomain(saved);
	}

	async update(id: string, data: Partial<Entity>): Promise<Domain | null> {
		if (!(await this.exists(id))) {
			return null;
		}

		const saved = await this.delegate.update({ where: { id }, data });

		return this.toDomain(saved);
	}

	async save(domain: Domain): Promise<Domain | null> {
		return this.update(domain.id, this.toPersistence(domain));
	}

	/** Soft delete: sets deletedDate (and deletedBy when given). */
	async delete(id: string, deletedBy: string | null = null): Promise<boolean> {
		const result = await this.delegate.updateMany({
			where: { id, ...notDeleted },
			data: { deletedDate: new Date(), deletedBy },
		});

		return result.count > 0;
	}

	async paginate(request: PageRequest): Promise<Page<Domain>> {
		const where = notDeleted;
		const [totalItems, entities] = await Promise.all([
			this.delegate.count({ where }),
			this.delegate.findMany({
				where,
				skip: (request.page - 1) * request.limit,
				take: request.limit,
				orderBy: { createdDate: 'desc' },
			}),
		]);

		return {
			items: entities.map((entity) => this.toDomain(entity)),
			totalItems,
			page: request.page,
			limit: request.limit,
		};
	}

	private async exists(id: string): Promise<boolean> {
		return (await this.delegate.count({ where: { id, ...notDeleted } })) > 0;
	}
}
