export abstract class ValueObject<TProps> {
	protected constructor(protected readonly props: Readonly<TProps>) {}

	equals(other: ValueObject<TProps>): boolean {
		return JSON.stringify(this.props) === JSON.stringify(other.props);
	}
}
