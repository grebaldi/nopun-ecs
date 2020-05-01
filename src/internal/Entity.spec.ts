import { Entity, AttemptToAssignDuplicateComponent, AttemptToRemoveUnassignedComponent, AttemptToGetUnassignedComponent, AttemptToUpdateUnassignedComponent } from "./Entity";

describe('Entity', () => {
	it(`allows for components to be added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent);

		expect(entity.has(DummyComponent)).toBe(true);
		expect(entity.get(DummyComponent)).toBeInstanceOf(DummyComponent);
	});

	it(`allows for components to be updated.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent);

		expect(entity.get(DummyComponent).property).toBe('foo');

		entity.update(DummyComponent, { property: 'bar' });

		expect(entity.get(DummyComponent).property).toBe('bar');
	});

	it(`allows for components to be removed.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent);
		entity.remove(DummyComponent);

		expect(entity.has(DummyComponent)).toBe(false);
		expect(() => entity.get(DummyComponent)).toThrow();
	});

	it(`allows for components to be retrieved.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent);

		expect(() => entity.get(DummyComponent)).not.toThrow();
		expect(entity.get(DummyComponent)).toBeInstanceOf(DummyComponent);
		expect(entity.get(DummyComponent).property).toBe('foo');
	});

	it(`allows to initialize components when they're added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent, { property: 'bar' });

		expect(() => entity.get(DummyComponent)).not.toThrow();
		expect(entity.get(DummyComponent)).toBeInstanceOf(DummyComponent);
		expect(entity.get(DummyComponent).property).toBe('bar');
	});

	it(`provides a fluent interface for adding components.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'fuu' }
		class DummyComponent3 { property = 'fizz' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity
			.add(DummyComponent1)
			.add(DummyComponent2)
			.add(DummyComponent3, { property: 'buzz' });

		expect(entity.has(DummyComponent1)).toBe(true);
		expect(() => entity.get(DummyComponent1)).not.toThrow();
		expect(entity.get(DummyComponent1)).toBeInstanceOf(DummyComponent1);
		expect(entity.get(DummyComponent1).property).toBe('foo');

		expect(entity.has(DummyComponent2)).toBe(true);
		expect(() => entity.get(DummyComponent2)).not.toThrow();
		expect(entity.get(DummyComponent2)).toBeInstanceOf(DummyComponent2);
		expect(entity.get(DummyComponent2).property).toBe('fuu');

		expect(entity.has(DummyComponent3)).toBe(true);
		expect(() => entity.get(DummyComponent3)).not.toThrow();
		expect(entity.get(DummyComponent3)).toBeInstanceOf(DummyComponent3);
		expect(entity.get(DummyComponent3).property).toBe('buzz');
	});

	it(`provides a fluent interface for removing components.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'fuu' }
		class DummyComponent3 { property = 'fizz' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent1);
		entity.add(DummyComponent2);
		entity.add(DummyComponent3);

		entity
			.remove(DummyComponent1)
			.remove(DummyComponent2)
			.remove(DummyComponent3);

		expect(entity.has(DummyComponent1)).toBe(false);
		expect(() => entity.get(DummyComponent1)).toThrow();

		expect(entity.has(DummyComponent2)).toBe(false);
		expect(() => entity.get(DummyComponent2)).toThrow();

		expect(entity.has(DummyComponent3)).toBe(false);
		expect(() => entity.get(DummyComponent3)).toThrow();
	});

	it(`prevents duplicate components from being added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent);

		expect(() => entity.add(DummyComponent))
			.toThrowError(
				new AttemptToAssignDuplicateComponent(entity, DummyComponent)
			);
	});

	it(`prevents unknown components from being updated.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		expect(() => entity.update(DummyComponent, { property: 'bar' }))
			.toThrowError(
				new AttemptToUpdateUnassignedComponent(entity, DummyComponent)
			);
	});

	it(`prevents unknown components from being removed.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		expect(() => entity.remove(DummyComponent))
			.toThrowError(
				new AttemptToRemoveUnassignedComponent(entity, DummyComponent)
			);
	});

	it(`raises an error on the attempt of retrieving an unknown component.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: () => {} }
		const entity = new Entity(updateQueue);

		expect(() => entity.get(DummyComponent))
			.toThrowError(
				new AttemptToGetUnassignedComponent(entity, DummyComponent)
			);
	});

	it(`schedules itself for update when a component is added.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: jest.fn() }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent);

		expect(updateQueue.queueForUpdate).toHaveBeenCalledTimes(1);
	});

	it(`schedules itself for update when a component is removed.`, () => {
		class DummyComponent { property = 'foo' }
		const updateQueue = { queueForUpdate: jest.fn() }
		const entity = new Entity(updateQueue);

		entity.add(DummyComponent);

		expect(updateQueue.queueForUpdate).toHaveBeenCalledTimes(1);

		entity.remove(DummyComponent);

		expect(updateQueue.queueForUpdate).toHaveBeenCalledTimes(2);
	});
});
