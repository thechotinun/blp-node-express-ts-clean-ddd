/**
 * Columns every table carries. Mirror these in each Prisma model
 * (see prisma/schema.prisma) — Prisma has no model inheritance.
 */
export interface BaseEntity {
	id: string;
	createdDate: Date;
	createdBy: string | null;
	updatedDate: Date;
	updatedBy: string | null;
	isActive: boolean;
	deletedDate: Date | null;
	deletedBy: string | null;
}
