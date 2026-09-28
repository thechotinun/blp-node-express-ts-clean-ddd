/** Base fields every output DTO exposes. */
export interface BaseDto {
	id: string;
	isActive: boolean;
	createdDate: string;
	createdBy: string | null;
	updatedDate: string;
	updatedBy: string | null;
}
