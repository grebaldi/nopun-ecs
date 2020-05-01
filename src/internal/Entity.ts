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
	private readonly componentsStore = new Map<ComponentConstructor, Component>();
	constructor(
		private readonly updateQueue: IUpdateQueue
	) {}

	public add<C extends Component>(
		CC: ComponentConstructor<C>,
		initialValue: Partial<C> = {}
	): this {
		if (this.componentsStore.has(CC))
			throw new AttemptToAssignDuplicateComponent(this, CC);

		const component = new CC();
		Object.assign(component, initialValue);
		this.componentsStore.set(CC, component);
		this.updateQueue.queueForUpdate(this);

		return this;
	}

	public update<C extends Component>(
		CC: ComponentConstructor<C>,
		overwriteValue: Partial<C>
	): this {
		if (!this.componentsStore.has(CC))
			throw new AttemptToUpdateUnassignedComponent(this, CC);

		const component = this.componentsStore.get(CC) as C;
		Object.assign(component, overwriteValue);

		return this;
	}

	public remove(CC: ComponentConstructor): this {
		if (!this.componentsStore.has(CC))
			throw new AttemptToRemoveUnassignedComponent(this, CC);

		this.componentsStore.delete(CC);
		this.updateQueue.queueForUpdate(this);
		return this;
	}

	public has(CC: ComponentConstructor): boolean {
		return this.componentsStore.has(CC);
	}

	public get<C extends Component>(CC: ComponentConstructor<C>): C {
		if (!this.componentsStore.has(CC))
			throw new AttemptToGetUnassignedComponent(this, CC);

		return this.componentsStore.get(CC) as C;
	}
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

export class AttemptToUpdateUnassignedComponent extends EntityError {
	constructor(
		public readonly entity: Entity,
		public readonly CC: ComponentConstructor
	) {
		super(
			`Component "${CC.name}" cannot be updated for entity, ` +
			`because the entity has no component "${CC.name}".`
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
