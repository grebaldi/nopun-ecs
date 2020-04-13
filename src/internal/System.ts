import { Scene } from "./Scene";
import { Filter } from "./Filter";
import { Query, IQueryReader } from "./Query";

export abstract class System {
	static queries: {
		[key: string]: Filter
	} = {};

	public constructor(
		protected readonly scene: Scene,
		protected readonly queries: {
			[key: string]: IQueryReader
		}
	) {}

	public initialize() {}
	public destroy() {}
	public abstract execute(deltaTime: number): void;
}

export type SystemConstructor<S extends System = any> = {
	new(
		scene: Scene,
		queries: {
			[key: string]: IQueryReader
		}
	): S
	queries: {
		[key: string]: Filter
	}
}

export class SystemContainer {
	constructor(
		public readonly system: System,
		public readonly queries: Query[]
	) {}
}
