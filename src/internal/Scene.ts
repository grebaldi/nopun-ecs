import { Resource, ResourceConstructor } from "./Resource";
import { SystemConstructor, System, SystemContainer } from "./System";
import { Query, IQueryReader } from "./Query";
import { Entity } from "./Entity";

export class Scene {
	private parent: Scene | null = null;

	public readonly debug = (() => {
		const self = this;

		return {
			get scenes() {
				let result = 1;

				for (const scene of self.scenesStore) {
					result += scene.debug.scenes;
				}

				return result;
			},

			get resources() {
				return self.resourcesStore.size;
			},

			get systems() {
				return self.systemsStore.size;
			},

			get entities() {
				return self.entitiesStore.size;
			}
		}
	})();

	private readonly scenesStore = new Set<Scene>();
	public readonly scenes = (() => {
		const self = this;
		const store = this.scenesStore;

		function attach(scene: Scene) {
			if (scene === self)
				throw new AttemptToAttachSceneToItself(scene);
			else if (store.has(scene))
				throw new AttemptToAttachDuplicateScene(self, scene)
			else if (scene.parent !== null)
				throw new AttemptToAttachSceneThatIsAlreadyAttachedElsewhere(self, scene);
			else {
				let parent = self.parent;
				while (parent !== null) {
					if (parent === scene)
						throw new AttemptToCreateCircularReference(self, scene);

					parent = parent.parent;
				}

				scene.parent = self;
			}

			store.add(scene);
		}

		function detach(scene: Scene) {
			if (store.has(scene)) {
				scene.parent = null;
				return store.delete(scene);
			} else
				throw new AttemptToDetachUnattachedScene(self, scene);
		}

		return { attach, detach }
	})();

	private readonly resourcesStore = new Map<ResourceConstructor, Resource>();
	public readonly resources = (() => {
		const self = this;
		const store = this.resourcesStore;

		function add<R extends Resource>(
			RC: ResourceConstructor<R>,
			initialValue: Partial<R> = {}
		): R {
			if (store.has(RC))
				throw new AttemptToAddResourceThatAlreadyExists(self, RC);

			const resource = new RC();

			Object.assign(resource, initialValue);
			store.set(RC, resource);

			return resource;
		}

		function remove(RC: ResourceConstructor): void {
			if (!store.has(RC))
				throw new AttemptToRemoveResourceThatDoesNotExist(self, RC);

			store.delete(RC);
		}

		function get<R extends Resource>(RC: ResourceConstructor<R>): R {
			if (!store.has(RC))
				throw new AttemptToGetResourceThatDoesNotExist(self, RC);

			return store.get(RC) as R;
		}

		return { add, remove, get };
	})();

	private readonly systemsStore = new Map<SystemConstructor, SystemContainer>();
	public readonly systems = (() => {
		const self = this;
		const store = this.systemsStore;

		function register<S extends System>(SC: SystemConstructor<S>) {
			if (store.has(SC))
				throw new AttemptToRegisterDuplicateSystem(self, SC);

			let queries: Query[] = [];
			let queryReaders: { [key: string]: IQueryReader } = {};

			for (const [key, filter] of Object.entries(SC.queries)) {
				const query = new Query(filter);

				queries.push(query);
				queryReaders[key] = query.reader;
			}

			const system = new SC(self, queryReaders);
			const container = new SystemContainer(system, queries);

			store.set(SC, container);
			system.initialize();
		}

		function unregister(SC: SystemConstructor) {
			if (!store.has(SC))
				throw new AttemptToUnregisterUnknownSystem(self, SC);

			store.delete(SC);
		}

		return { register, unregister };
	})();

	private readonly entitiesThatNeedTobeUpdated = new Set<Entity>();
	private readonly entityUpdateQueue = (() => {
		const queue = this.entitiesThatNeedTobeUpdated;

		function queueForUpdate(entity: Entity) {
			queue.add(entity);
		}

		return { queueForUpdate };
	})();
	private readonly entitiesStore = new Set<Entity>();
	public readonly entities = (() => {
		const self = this;
		const store = this.entitiesStore;

		function create(): Entity {
			const entity = new Entity(self.entityUpdateQueue);
			store.add(entity);
			return entity;
		}

		function exists(entity: Entity): boolean {
			return store.has(entity);
		}

		function destroy(entity: Entity) {
			if (!store.has(entity))
				throw new AttemptToDestroyUnknownOrForeignEntity(self, entity);

			store.delete(entity);

			for (const [,{queries}] of self.systemsStore) {
				for (const query of queries) {
					query.writer.remove(entity);
				}
			}
		}

		return { create, exists, destroy };
	})();

	public execute(deltaTime: number): void {
		for (const [,{queries}] of this.systemsStore) {
			for (const query of queries) {
				query.writer.flush();
			}
		}

		for (const [,{system}] of this.systemsStore) {
			for (const entity of this.entitiesThatNeedTobeUpdated) {
				for (const [,{queries}] of this.systemsStore) {
					for (const query of queries) {
						query.writer.update(entity);
					}
				}
			}

			this.entitiesThatNeedTobeUpdated.clear();

			system.execute(deltaTime);
		}

		for (const scene of this.scenesStore) {
			scene.execute(deltaTime);
		}
	}
}

export abstract class SceneError extends Error {
	constructor(message: string) {
		super(`[SceneError]: ${message}`);
	}
}

export class AttemptToAttachDuplicateScene extends SceneError {
	constructor(
		public readonly parentScene: Scene,
		public readonly childScene: Scene
	) {
		super(
			`Scene "${childScene.constructor.name}" cannot be added ` +
			`to "${parentScene.constructor.name}", because "${parentScene.constructor.name}" ` +
			`already has scene "${childScene.constructor.name}".`
		);
	}
}

export class AttemptToDetachUnattachedScene extends SceneError {
	constructor(
		public readonly parentScene: Scene,
		public readonly childScene: Scene
	) {
		super(
			`Scene "${childScene.constructor.name}" cannot be removed ` +
			`from "${parentScene.constructor.name}", because "${parentScene.constructor.name}" ` +
			`has no scene "${childScene.constructor.name}".`
		);
	}
}

export class AttemptToCreateCircularReference extends SceneError {
	constructor(
		public readonly parentScene: Scene,
		public readonly childScene: Scene
	) {
		super(
			`Scene "${childScene.constructor.name}" cannot be added ` +
			`to "${parentScene.constructor.name}", because this would create ` +
			`a circular reference`
		);
	}
}

export class AttemptToAttachSceneThatIsAlreadyAttachedElsewhere extends SceneError {
	constructor(
		public readonly parentScene: Scene,
		public readonly childScene: Scene
	) {
		super(
			`Scene "${childScene.constructor.name}" cannot be added ` +
			`to "${parentScene.constructor.name}", because "${parentScene.constructor.name}" ` +
			`already belongs to another scene.`
		);
	}
}

export class AttemptToAttachSceneToItself extends SceneError {
	constructor(
		public readonly scene: Scene
	) {
		super(
			`Scene "${scene.constructor.name}" cannot be added to itself.`
		);
	}
}

export class AttemptToAddResourceThatAlreadyExists extends SceneError {
	public constructor(
		public readonly scene: Scene,
		public readonly RC: ResourceConstructor
	) {
		super(
			`Resource "${RC.name}" cannot be added ` +
			`to "${scene.constructor.name}", because "${scene.constructor.name}" ` +
			`already has resource "${RC.name}".`
		);
	}
}

export class AttemptToRemoveResourceThatDoesNotExist extends SceneError {
	public constructor(
		public readonly scene: Scene,
		public readonly RC: ResourceConstructor
	) {
		super(
			`Resource "${RC.name}" cannot be removed ` +
			`from "${scene.constructor.name}", because "${scene.constructor.name}" ` +
			`has no resource "${RC.name}".`
		);
	}
}

export class AttemptToGetResourceThatDoesNotExist extends SceneError {
	public constructor(
		public readonly scene: Scene,
		public readonly RC: ResourceConstructor
	) {
		super(
			`Resource "${RC.name}" cannot be retrieved ` +
			`from "${scene.constructor.name}", because "${scene.constructor.name}" ` +
			`has no resource "${RC.name}".`
		);
	}
}

export class AttemptToRegisterDuplicateSystem extends SceneError {
	public constructor(
		public readonly scene: Scene,
		public readonly SC: SystemConstructor
	) {
		super(
			`System "${SC.name}" cannot be registered ` +
			`to "${scene.constructor.name}", because "${scene.constructor.name}" ` +
			`already has a registered system "${SC.name}".`
		);
	}
}

export class AttemptToUnregisterUnknownSystem extends SceneError {
	public constructor(
		public readonly scene: Scene,
		public readonly SC: SystemConstructor
	) {
		super(
			`System "${SC.name}" cannot be unregisterend ` +
			`from "${scene.constructor.name}", because "${scene.constructor.name}" ` +
			`does not have a registered system "${SC.name}".`
		);
	}
}

export class AttemptToDestroyUnknownOrForeignEntity extends SceneError {
	public constructor(
		public readonly scene: Scene,
		public readonly entity: Entity
	) {
		super(
			`Entity cannot be destroyed ` +
			`by "${scene.constructor.name}", because ` +
			`it was not created by "${scene.constructor.name}".`
		);
	}
}
