export abstract class Entity<TProps> {
	protected constructor(
		public readonly id: string,
		protected props: TProps,
	) {}

	equals(other: Entity<TProps>): boolean {
		return this.id === other.id;
	}
}
