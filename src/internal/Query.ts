import { Filter, Negation } from "./Filter";
import { Entity } from "./Entity";

export interface IQueryWriter {
	add: (entity: Entity) => any;
	update: (entity: Entity) => any;
	remove: (entity: Entity) => any;
}

export interface IQueryReader {
	count: number
	results: Iterable<Entity>
	has: (entity: Entity) => boolean
}

export class Query {
	private readonly store = new Set<Entity>();
	constructor(
		private readonly filter: Filter
	) {}

	public matches(entity: Entity): boolean {
		return this.filter.every(f => {
			if (f instanceof Negation) {
				return !entity.has(f.subject);
			} else {
				return entity.has(f);
			}
		});
	}

	public readonly writer: IQueryWriter = (() => {
		const query = this;

		function add(entity: Entity) {
			if(query.matches(entity))
				query.store.add(entity);
		}

		function update(entity: Entity) {
			if(query.matches(entity))
				query.store.add(entity);
			else
				query.store.delete(entity);
		}

		function remove(entity: Entity) {
			query.store.delete(entity);
		}

		return { add, update, remove };
	})();

	public readonly reader: IQueryReader = (() => {
		const query = this;

		function has(entity: Entity): boolean {
			return query.store.has(entity);
		}

		return {
			get count() { return query.store.size },
			results: query.store,
			has
		};
	})();
}
