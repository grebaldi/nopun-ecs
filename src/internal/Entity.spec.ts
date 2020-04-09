import { Entity, AttemptToAssignDuplicateComponent, AttemptToRemoveUnassignedComponent, AttemptToGetUnassignedComponent } from "./Entity";

describe('Entity', () => {
	it(`allows for components to be added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent);

		expect(entity.components.has(DummyComponent)).toBe(true);
		expect(entity.components.get(DummyComponent)).toBeInstanceOf(DummyComponent);
	});

	it(`allows for components to be removed.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent);
		entity.components.remove(DummyComponent);

		expect(entity.components.has(DummyComponent)).toBe(false);
		expect(() => entity.components.get(DummyComponent)).toThrow();
	});

	it(`allows for components to be retrieved.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent);

		expect(() => entity.components.get(DummyComponent)).not.toThrow();
		expect(entity.components.get(DummyComponent)).toBeInstanceOf(DummyComponent);
		expect(entity.components.get(DummyComponent).property).toBe('foo');
	});

	it(`allows to initialize components when they're added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent, { property: 'bar' });

		expect(() => entity.components.get(DummyComponent)).not.toThrow();
		expect(entity.components.get(DummyComponent)).toBeInstanceOf(DummyComponent);
		expect(entity.components.get(DummyComponent).property).toBe('bar');
	});

	it(`provides a fluent interface for adding components.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'fuu' }
		class DummyComponent3 { property = 'fizz' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.components
			.add(DummyComponent1)
			.add(DummyComponent2)
			.add(DummyComponent3, { property: 'buzz' });

		expect(entity.components.has(DummyComponent1)).toBe(true);
		expect(() => entity.components.get(DummyComponent1)).not.toThrow();
		expect(entity.components.get(DummyComponent1)).toBeInstanceOf(DummyComponent1);
		expect(entity.components.get(DummyComponent1).property).toBe('foo');

		expect(entity.components.has(DummyComponent2)).toBe(true);
		expect(() => entity.components.get(DummyComponent2)).not.toThrow();
		expect(entity.components.get(DummyComponent2)).toBeInstanceOf(DummyComponent2);
		expect(entity.components.get(DummyComponent2).property).toBe('fuu');

		expect(entity.components.has(DummyComponent3)).toBe(true);
		expect(() => entity.components.get(DummyComponent3)).not.toThrow();
		expect(entity.components.get(DummyComponent3)).toBeInstanceOf(DummyComponent3);
		expect(entity.components.get(DummyComponent3).property).toBe('buzz');
	});

	it(`provides a fluent interface for removing components.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'fuu' }
		class DummyComponent3 { property = 'fizz' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent1);
		entity.components.add(DummyComponent2);
		entity.components.add(DummyComponent3);

		entity.components
			.remove(DummyComponent1)
			.remove(DummyComponent2)
			.remove(DummyComponent3);

		expect(entity.components.has(DummyComponent1)).toBe(false);
		expect(() => entity.components.get(DummyComponent1)).toThrow();

		expect(entity.components.has(DummyComponent2)).toBe(false);
		expect(() => entity.components.get(DummyComponent2)).toThrow();

		expect(entity.components.has(DummyComponent3)).toBe(false);
		expect(() => entity.components.get(DummyComponent3)).toThrow();
	});

	it(`prevents duplicate components from being added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent);

		expect(() => entity.components.add(DummyComponent))
			.toThrowError(
				new AttemptToAssignDuplicateComponent(entity, DummyComponent)
			);
	});

	it(`prevents unknown components from being removed.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		expect(() => entity.components.remove(DummyComponent))
			.toThrowError(
				new AttemptToRemoveUnassignedComponent(entity, DummyComponent)
			);
	});

	it(`raises an error on the attempt of retrieving an unknown component.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		expect(() => entity.components.get(DummyComponent))
			.toThrowError(
				new AttemptToGetUnassignedComponent(entity, DummyComponent)
			);
	});

	it(`schedules itself for update when a component is added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: jest.fn() }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent);

		expect(updateQueue.queueForUpdate).toHaveBeenCalledTimes(1);
	});

	it(`schedules itself for update when a component is removed.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: jest.fn() }
		const entity = new Entity(updateQueue);

		entity.components.add(DummyComponent);

		expect(updateQueue.queueForUpdate).toHaveBeenCalledTimes(1);

		entity.components.remove(DummyComponent);

		expect(updateQueue.queueForUpdate).toHaveBeenCalledTimes(2);
	});
});
