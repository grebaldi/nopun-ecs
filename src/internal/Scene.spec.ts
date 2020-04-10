import { Scene, AttemptToGetResourceThatDoesNotExist, AttemptToAddResourceThatAlreadyExists, AttemptToRemoveResourceThatDoesNotExist, AttemptToAttachDuplicateScene, AttemptToDetachUnattachedScene, AttemptToCreateCircularReference, AttemptToAttachSceneToItself, AttemptToAttachSceneThatIsAlreadyAttachedElsewhere, AttemptToRegisterDuplicateSystem, AttemptToUnregisterUnknownSystem, AttemptToDestroyUnknownOrForeignEntity } from "./Scene";
import { System } from "./System";
import { Entity } from "./Entity";
import { Query } from "./Query";

describe(`Scene > Scene Graph Management`, () => {
	it(`should allow for child scenes to be added.`, () => {
		const parentScene = new Scene();
		const childScene = new Scene();

		expect((parentScene as any).scenesStore.size).toBe(0);
		expect((childScene as any).scenesStore.size).toBe(0);

		parentScene.scenes.attach(childScene);

		expect((parentScene as any).scenesStore.size).toBe(1);
		expect((childScene as any).scenesStore.size).toBe(0);

		expect((childScene as any).parent).toBe(parentScene);
	});

	it(`should allow for child scenes to be removed.`, () => {
		const parentScene = new Scene();
		const childScene = new Scene();

		parentScene.scenes.attach(childScene);

		expect((parentScene as any).scenesStore.size).toBe(1);
		expect((childScene as any).scenesStore.size).toBe(0);

		parentScene.scenes.detach(childScene);

		expect((parentScene as any).scenesStore.size).toBe(0);
		expect((childScene as any).scenesStore.size).toBe(0);

		expect((childScene as any).parent).toBe(null);
	});

	it(`should prevent duplicate child scenes from being added`, () => {
		const parentScene = new Scene();
		const childScene = new Scene();

		parentScene.scenes.attach(childScene);

		expect(() => parentScene.scenes.attach(childScene))
			.toThrowError(
				new AttemptToAttachDuplicateScene(
					parentScene,
					childScene
				)
			);
	});

	it(`should prevent unknown child scenes from being removed`, () => {
		const parentScene = new Scene();
		const childScene = new Scene();

		expect(() => parentScene.scenes.detach(childScene))
			.toThrowError(
				new AttemptToDetachUnattachedScene(
					parentScene,
					childScene
				)
			);
	});

	it(`should prevent circular references`, () => {
		const parentScene = new Scene();
		const childScene = new Scene();
		const grandchildScene = new Scene();

		parentScene.scenes.attach(childScene);
		childScene.scenes.attach(grandchildScene);

		expect(() => childScene.scenes.attach(parentScene))
			.toThrowError(
				new AttemptToCreateCircularReference(
					parentScene,
					childScene
				)
			);

		expect(() => grandchildScene.scenes.attach(parentScene))
			.toThrowError(
				new AttemptToCreateCircularReference(
					parentScene,
					childScene
				)
			);
	});

	it(`should prevent scene from being added to itself.`, () => {
		const scene = new Scene();

		expect(() => scene.scenes.attach(scene))
			.toThrowError(
				new AttemptToAttachSceneToItself(scene)
			);
	});

	it(`should prevent children from being added that already have a parent.`, () => {
		const parentScene = new Scene();
		const childScene = new Scene();
		const grandchildScene = new Scene();

		parentScene.scenes.attach(childScene);
		childScene.scenes.attach(grandchildScene);

		expect(() => parentScene.scenes.attach(grandchildScene))
			.toThrowError(
				new AttemptToAttachSceneThatIsAlreadyAttachedElsewhere(
						parentScene,
						childScene
					)
			);
	});

	it(`should allow for grand child scenes to be added to child scenes`, () => {
		const parentScene = new Scene();
		const childScene = new Scene();
		const grandchildScene = new Scene();

		parentScene.scenes.attach(childScene);

		expect(() => childScene.scenes.attach(grandchildScene))
			.not.toThrow();

		expect((parentScene as any).scenesStore.size).toBe(1);
		expect((childScene as any).scenesStore.size).toBe(1);

		expect((childScene as any).parent).toBe(parentScene);
		expect((grandchildScene as any).parent).toBe(childScene);
	});

	it(`should execute all known child scenes along with its own execution`, () => {
		const parentScene = new Scene();
		const childScenes = Array(3).fill(null).map(_ => {
			const scene = new Scene() as any;

			scene.execute = jest.fn();

			return scene as unknown as Scene;
		});

		parentScene.scenes.attach(childScenes[0]);
		parentScene.scenes.attach(childScenes[1]);
		parentScene.scenes.attach(childScenes[2]);

		expect((parentScene as any).scenesStore.size).toBe(3);

		parentScene.execute(.0016);

		expect((childScenes[0].execute as jest.Mock).mock.calls.length)
			.toBe(1);
		expect((childScenes[1].execute as jest.Mock).mock.calls.length)
			.toBe(1);
		expect((childScenes[2].execute as jest.Mock).mock.calls.length)
			.toBe(1);

		parentScene.execute(.0016);

		expect((childScenes[0].execute as jest.Mock).mock.calls.length)
			.toBe(2);
		expect((childScenes[1].execute as jest.Mock).mock.calls.length)
			.toBe(2);
		expect((childScenes[2].execute as jest.Mock).mock.calls.length)
			.toBe(2);

		parentScene.scenes.detach(childScenes[1]);
		parentScene.execute(.0016);

		expect((childScenes[0].execute as jest.Mock).mock.calls.length)
			.toBe(3);
		expect((childScenes[1].execute as jest.Mock).mock.calls.length)
			.toBe(2);
		expect((childScenes[2].execute as jest.Mock).mock.calls.length)
			.toBe(3);
	});
});

describe(`Scene > Resource Management`, () => {
	it(`should allow for resources to be added.`, () => {
		class DummyResource1 { property = 'foo' }
		class DummyResource2 { property = 'fuu' }
		const scene = new Scene();

		expect(scene.resources.add(DummyResource1))
			.toMatchObject({ property: 'foo' });

		expect(scene.resources.get(DummyResource1))
			.toMatchObject({ property: 'foo' });

		expect(scene.resources.add(DummyResource2, { property: 'bar' }))
			.toMatchObject({ property: 'bar' });

		expect(scene.resources.get(DummyResource2))
			.toMatchObject({ property: 'bar' });
	});

	it(`should allow for resources to be removed.`, () => {
		class DummyResource1 { property = 'foo' }
		class DummyResource2 { property = 'fuu' }
		const scene = new Scene();

		scene.resources.add(DummyResource1);
		scene.resources.add(DummyResource2);

		expect(scene.resources.get(DummyResource1))
			.toMatchObject({ property: 'foo' });

		expect(scene.resources.get(DummyResource2))
			.toMatchObject({ property: 'fuu' });

		scene.resources.remove(DummyResource1);
		scene.resources.remove(DummyResource2);

		expect(() => scene.resources.get(DummyResource1))
			.toThrowError(
				new AttemptToGetResourceThatDoesNotExist(
					scene,
					DummyResource1
				)
			);

		expect(() => scene.resources.get(DummyResource2))
			.toThrowError(
				new AttemptToGetResourceThatDoesNotExist(
						scene,
						DummyResource2
					)
			);
	});

	it(`should prevent duplicate resources from being added`, () => {
		class DummyResource { property = 'foo' }
		const scene = new Scene();

		scene.resources.add(DummyResource);

		expect(() => scene.resources.add(DummyResource))
			.toThrowError(
				new AttemptToAddResourceThatAlreadyExists(
					scene,
					DummyResource
				)
			);
	});

	it(`should prevent unknown resources from being removed`, () => {
		class DummyResource { property = 'foo' }
		const scene = new Scene();

		expect(() => scene.resources.remove(DummyResource))
			.toThrowError(
				new AttemptToRemoveResourceThatDoesNotExist(
					scene,
					DummyResource
				)
			);
	});
});

describe(`Scene > Systems Management`, () => {
	it(`should allow for systems to be registered.`, () => {
		class DummySystem extends System { execute: () => {} }
		const scene = new Scene();

		expect(() => scene.systems.register(DummySystem))
			.not.toThrow();

		expect((scene as any).systemsStore.size).toBe(1);
	});

	it(`initializes systems upon registration`, () => {
		const initialize = jest.fn();
		class DummySystem extends System {
			initialize = initialize;
			execute: () => {}
		}
		const scene = new Scene();

		expect(() => scene.systems.register(DummySystem))
			.not.toThrow();

		expect(initialize).toHaveBeenCalledTimes(1);
	});

	it(`should allow for systems to be removed.`, () => {
		class DummySystem extends System { execute: () => {} }
		const scene = new Scene();

		scene.systems.register(DummySystem);

		expect((scene as any).systemsStore.size).toBe(1);

		expect(() => scene.systems.unregister(DummySystem))
			.not.toThrow();

		expect((scene as any).systemsStore.size).toBe(0);
	});

	it(`should prevent duplicate systems from being added`, () => {
		class DummySystem extends System { execute: () => {} }
		const scene = new Scene();

		scene.systems.register(DummySystem);

		expect(() => scene.systems.register(DummySystem))
			.toThrowError(
				new AttemptToRegisterDuplicateSystem(scene, DummySystem)
			);
	});

	it(`should prevent unknown systems from being removed`, () => {
		class DummySystem extends System { execute: () => {} }
		const scene = new Scene();

		expect(() => scene.systems.unregister(DummySystem))
			.toThrowError(
				new AttemptToUnregisterUnknownSystem(scene, DummySystem)
			);
	});

	it(`should execute all known systems along with its own execution`, () => {
		class DummySystem1 extends System { execute = jest.fn() }
		class DummySystem2 extends System { execute = jest.fn() }
		class DummySystem3 extends System { execute = jest.fn() }
		const scene = new Scene();

		scene.systems.register(DummySystem1);
		scene.systems.register(DummySystem2);
		scene.systems.register(DummySystem3);

		const system1 = (scene as any).systemsStore.get(DummySystem1).system as DummySystem1;
		const system2 = (scene as any).systemsStore.get(DummySystem2).system as DummySystem2;
		const system3 = (scene as any).systemsStore.get(DummySystem3).system as DummySystem3;

		expect(system1).toBeInstanceOf(DummySystem1);
		expect(system2).toBeInstanceOf(DummySystem2);
		expect(system3).toBeInstanceOf(DummySystem3);

		scene.execute(.00161);

		expect(system1.execute).toHaveBeenCalledTimes(1);
		expect(system1.execute).toHaveBeenLastCalledWith(.00161);

		expect(system2.execute).toHaveBeenCalledTimes(1);
		expect(system2.execute).toHaveBeenLastCalledWith(.00161);

		expect(system3.execute).toHaveBeenCalledTimes(1);
		expect(system3.execute).toHaveBeenLastCalledWith(.00161);

		scene.execute(.00162);

		expect(system1.execute).toHaveBeenCalledTimes(2);
		expect(system1.execute).toHaveBeenLastCalledWith(.00162);

		expect(system2.execute).toHaveBeenCalledTimes(2);
		expect(system2.execute).toHaveBeenLastCalledWith(.00162);

		expect(system3.execute).toHaveBeenCalledTimes(2);
		expect(system3.execute).toHaveBeenLastCalledWith(.00162);

		scene.systems.unregister(DummySystem2);
		scene.execute(.00163);

		expect(system1.execute).toHaveBeenCalledTimes(3);
		expect(system1.execute).toHaveBeenLastCalledWith(.00163);

		expect(system2.execute).toHaveBeenCalledTimes(2);
		expect(system2.execute).toHaveBeenLastCalledWith(.00162);

		expect(system3.execute).toHaveBeenCalledTimes(3);
		expect(system3.execute).toHaveBeenLastCalledWith(.00163);
	});
});

describe(`Scene > Entity Management`, () => {
	it(`creates entities.`, () => {
		const scene = new Scene();
		const entity = scene.entities.create();

		expect(entity).not.toBe(null);
		expect(entity).toBeInstanceOf(Entity);
		expect((scene as any).entitiesStore.size).toBe(1);
		expect((scene as any).entitiesStore.has(entity)).toBe(true);
	});

	it(`destroys entities.`, () => {
		const scene = new Scene();
		const entity = scene.entities.create();

		expect(() => scene.entities.destroy(entity))
			.not.toThrow();

		expect((scene as any).entitiesStore.size).toBe(0);
		expect((scene as any).entitiesStore.has(entity)).toBe(false);
	});

	it(`can tell whether an entity exists.`, () => {
		const scene = new Scene();
		const entity = scene.entities.create();

		expect(scene.entities.exists(entity)).toBe(true);

		scene.entities.destroy(entity);

		expect(scene.entities.exists(entity)).toBe(false);
	});

	it(`prevents unknown entities from being destroyed.`, () => {
		const scene1 = new Scene();
		const scene2 = new Scene();
		const entity = scene2.entities.create();

		expect(() => scene1.entities.destroy(entity))
			.toThrowError(
				new AttemptToDestroyUnknownOrForeignEntity(scene1, entity)
			);
	});

	it(`updates system queries with queued entities alongside its own execution.`, () => {
		const check1 = jest.fn();
		const check2 = jest.fn();
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		class DummySystem1 extends System {
			static queries = {
				foos: [DummyComponent1]
			};

			execute(dt: number) {
				for (const entity of this.queries.foos.all) {
					check1(dt, entity);
				}
			}
		}
		class DummySystem2 extends System {
			static queries = {
				foos: [DummyComponent2]
			};

			execute(dt: number) {
				for (const entity of this.queries.foos.all) {
					check2(dt, entity);
				}
			}
		}
		const scene = new Scene();
		const entity1 = scene.entities.create();
		const entity2 = scene.entities.create();

		scene.systems.register(DummySystem1);
		scene.systems.register(DummySystem2);

		entity1.add(DummyComponent1);
		entity2.add(DummyComponent2);

		scene.execute(.00161);

		expect(check1).toHaveBeenCalledTimes(1);
		expect(check1).toHaveBeenLastCalledWith(.00161, entity1);

		expect(check2).toHaveBeenCalledTimes(1);
		expect(check2).toHaveBeenLastCalledWith(.00161, entity2);

		entity1.add(DummyComponent2);
		scene.execute(.00162);

		expect(check1).toHaveBeenCalledTimes(2);
		expect(check1).toHaveBeenLastCalledWith(.00162, entity1);

		expect(check2).toHaveBeenCalledTimes(3);
		expect(check2).toHaveBeenLastCalledWith(.00162, entity1);

		entity1.remove(DummyComponent2);
		entity2.remove(DummyComponent2);
		scene.execute(.00163);

		expect(check1).toHaveBeenCalledTimes(3);
		expect(check1).toHaveBeenLastCalledWith(.00163, entity1);

		expect(check2).toHaveBeenCalledTimes(3);
		expect(check2).toHaveBeenLastCalledWith(.00162, entity1);

		entity2.add(DummyComponent2);
		scene.execute(.00164);

		expect(check1).toHaveBeenCalledTimes(4);
		expect(check1).toHaveBeenLastCalledWith(.00164, entity1);

		expect(check2).toHaveBeenCalledTimes(4);
		expect(check2).toHaveBeenLastCalledWith(.00164, entity2);

		scene.entities.destroy(entity1);
		scene.execute(.00165);

		expect(check1).toHaveBeenCalledTimes(4);
		expect(check1).toHaveBeenLastCalledWith(.00164, entity1);

		expect(check2).toHaveBeenCalledTimes(5);
		expect(check2).toHaveBeenLastCalledWith(.00165, entity2);

		scene.entities.destroy(entity2);
		scene.execute(.00166);

		expect(check1).toHaveBeenCalledTimes(4);
		expect(check1).toHaveBeenLastCalledWith(.00164, entity1);

		expect(check2).toHaveBeenCalledTimes(5);
		expect(check2).toHaveBeenLastCalledWith(.00165, entity2);
	});

	it('flushes query writers on every execution', () => {
		const check1 = jest.fn();
		const check2 = jest.fn();
		const check3 = jest.fn();
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		class SystemThatAddsDummyComponent2 extends System {
			static queries = {
				entities: [DummyComponent1]
			};

			execute(dt: number) {
				for (const entity of this.queries.entities.all) {
					check1(dt, entity);
					entity.add(DummyComponent2);
				}
			}

		}
		class SystemThatRemovesDummyComponent1 extends System {
			static queries = {
				entities: [DummyComponent1, DummyComponent2]
			};

			execute(dt: number) {
				for (const entity of this.queries.entities.all) {
					check2(dt, entity);
					entity.remove(DummyComponent1);
				}
			}
		}
		class DummySystem extends System {
			static queries = {
				entities: [DummyComponent2]
			};

			execute(dt: number) {
				for (const entity of this.queries.entities.all) {
					check3(dt, entity);
				}
			}
		}

		const scene = new Scene();
		const entity1 = scene.entities.create();
		const entity2 = scene.entities.create();
		const entity3 = scene.entities.create();

		scene.systems.register(SystemThatAddsDummyComponent2);
		scene.systems.register(SystemThatRemovesDummyComponent1);
		scene.systems.register(DummySystem);

		entity1.add(DummyComponent1);
		entity2.add(DummyComponent2);
		entity3.add(DummyComponent1);

		// Execute scene
		scene.execute(.00161);

		// check1 should have been called twice
		expect(check1).toHaveBeenCalledTimes(2);
		expect(check1).toHaveBeenNthCalledWith(1, .00161, entity1);
		expect(check1).toHaveBeenNthCalledWith(2, .00161, entity3);

		// check2 should have been called twice
		expect(check2).toHaveBeenCalledTimes(2);
		expect(check2).toHaveBeenNthCalledWith(1, .00161, entity1);
		expect(check2).toHaveBeenNthCalledWith(2, .00161, entity3);

		// check3 should have been called three times
		expect(check3).toHaveBeenCalledTimes(3);
		expect(check3).toHaveBeenNthCalledWith(1, .00161, entity2);
		expect(check3).toHaveBeenNthCalledWith(2, .00161, entity1);
		expect(check3).toHaveBeenNthCalledWith(3, .00161, entity3);

		// Execute Scene
		scene.execute(.00162);

		// check1 should have been called twice
		expect(check1).toHaveBeenCalledTimes(2);
		expect(check1).toHaveBeenLastCalledWith(.00161, entity3);

		// check2 should have been called twice
		expect(check2).toHaveBeenCalledTimes(2);
		expect(check2).toHaveBeenLastCalledWith(.00161, entity3);

		// check3 should have been called six times
		expect(check3).toHaveBeenCalledTimes(6);
		expect(check3).toHaveBeenNthCalledWith(4, .00162, entity2);
		expect(check3).toHaveBeenNthCalledWith(5, .00162, entity1);
		expect(check3).toHaveBeenNthCalledWith(6, .00162, entity3);
	});
});
