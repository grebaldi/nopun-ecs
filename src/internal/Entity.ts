import { ComponentConstructor, Component } from "./Component";

export interface IUpdateQueue {
	queueForUpdate: (entity: Entity) => any
}

export interface IComponentAdder {
	add: <C extends Component>(
		CC: ComponentConstructor<C>,
		initialValue?: Partial<C>
	) => IComponentAdder
}

export interface IComponentRemover {
	remove: (CC: ComponentConstructor) => IComponentRemover
}

export class Entity {
	constructor(
		private readonly updateQueue: IUpdateQueue
	) {}

	public readonly components = (() => {
		const entity = this;
		const store = new Map<ComponentConstructor, Component>();
		const adder = { add };
		const remover = { remove };

		function add<C extends Component>(
			CC: ComponentConstructor<C>,
			initialValue: Partial<C> = {}
		): IComponentAdder {
			if (store.has(CC))
				throw new AttemptToAssignDuplicateComponent(entity, CC);

			const component = new CC();
            Object.assign(component, initialValue);
			store.set(CC, component);
			entity.updateQueue.queueForUpdate(entity);

			return adder;
		}

		function remove(
			CC: ComponentConstructor
		): IComponentRemover {
			if (!store.has(CC))
				throw new AttemptToRemoveUnassignedComponent(entity, CC);

			store.delete(CC);
			entity.updateQueue.queueForUpdate(entity);
			return remover;
		}

		function has(CC: ComponentConstructor): boolean {
			return store.has(CC);
		}

		function get<C extends Component>(CC: ComponentConstructor<C>): C {
			if (!store.has(CC))
				throw new AttemptToGetUnassignedComponent(entity, CC);

			return store.get(CC) as C;
		}

		return { add, remove, has, get };
	})();
}

export class EntityError extends Error {
	constructor(message: string) {
		super(`[EntityError]: ${message}`);
	}
}

export class AttemptToAssignDuplicateComponent extends EntityError {
	constructor(
		public readonly entity: Entity,
		public readonly CC: ComponentConstructor
	) {
		super(
			`Component "${CC.name}" cannot be assigned to entity, ` +
			`because the entity already has a component "${CC.name}".`
		);
	}
}

export class AttemptToRemoveUnassignedComponent extends EntityError {
	constructor(
		public readonly entity: Entity,
		public readonly CC: ComponentConstructor
	) {
		super(
			`Component "${CC.name}" cannot be removed from entity, ` +
			`because the entity has no component "${CC.name}".`
		);
	}
}

export class AttemptToGetUnassignedComponent extends EntityError {
	constructor(
		public readonly entity: Entity,
		public readonly CC: ComponentConstructor
	) {
		super(
			`Component "${CC.name}" cannot be obtained from entity, ` +
			`because the entity has no component "${CC.name}".`
		);
	}
}
