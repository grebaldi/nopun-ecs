import { Filter, Negation } from "./Filter";
import { Entity } from "./Entity";

export interface IQueryWriter {
	add: (entity: Entity) => any;
	update: (entity: Entity) => any;
	remove: (entity: Entity) => any;
	flush: () => any;
}

export interface IQueryReader {
	count: number
	all: Iterable<Entity>
	added: Iterable<Entity>
	removed: Iterable<Entity>
	unchanged: Iterable<Entity>
	has: (entity: Entity) => boolean
}

export class Query {
	private readonly all = new Set<Entity>();
	private readonly added = new Set<Entity>();
	private readonly removed = new Set<Entity>();
	private readonly unchanged = new Set<Entity>();

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
			if(query.matches(entity) && !query.all.has(entity)) {
				query.all.add(entity);
				query.added.add(entity);
			}
		}

		function update(entity: Entity) {
			if(query.matches(entity)) {
				if (!query.all.has(entity)) {
					query.all.add(entity);
					query.added.add(entity);
				}
			} else if (query.all.has(entity)) {
				remove(entity);
			}
		}

		function remove(entity: Entity) {
			query.all.delete(entity);
			query.added.delete(entity);
			query.unchanged.delete(entity);

			query.removed.add(entity);
		}

		function flush() {
			for (const entity of query.added) {
				query.unchanged.add(entity);
			}

			query.added.clear();
			query.removed.clear();
		}

		return { add, update, remove, flush };
	})();

	public readonly reader: IQueryReader = (() => {
		const query = this;

		function has(entity: Entity): boolean {
			return query.all.has(entity);
		}

		return {
			get count() { return query.all.size },
			all: query.all,
			added: query.added,
			removed: query.removed,
			unchanged: query.unchanged,
			has
		};
	})();
}
