import { Entity } from "./Entity";
import { Query } from "./Query";
import { Not } from "./Filter";
import { Scene } from "./Scene";

describe('Query > Writer', () => {
	it(`stores matching entities.`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);

		entity.add(DummyComponent);

		expect(query.reader.count).toBe(0);

		expect(() => query.writer.add(entity))
			.not.toThrow();

		expect(query.reader.count).toBe(1);
		expect(query.reader.has(entity)).toBe(true);
	});

	it(`ignores non-matching entities.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		const scene = new Scene();
		const entity = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent1]);

		entity.add(DummyComponent2);

		expect(query.reader.count).toBe(0);

		expect(() => query.writer.add(entity))
			.not.toThrow();

		expect(query.reader.count).toBe(0);
		expect(query.reader.has(entity)).toBe(false);
	});

	it(`allows to remove matching entities.`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);

		entity.add(DummyComponent);
		query.writer.add(entity);

		expect(query.reader.count).toBe(1);
		expect(query.reader.has(entity)).toBe(true);

		expect(() => query.writer.remove(entity))
			.not.toThrow();

		expect(query.reader.count).toBe(0);
		expect(query.reader.has(entity)).toBe(false);
	});

	it(`allows to remove non-matching entities.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		const scene = new Scene();
		const entity = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent1]);

		entity.add(DummyComponent2);

		expect(query.reader.count).toBe(0);
		expect(query.reader.has(entity)).toBe(false);

		expect(() => query.writer.remove(entity))
			.not.toThrow();

		expect(query.reader.count).toBe(0);
		expect(query.reader.has(entity)).toBe(false);
	});
});

describe('Query > Reader', () => {
	it(`allows to iterate over matching entities.`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const entity3 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);

		entity1.add(DummyComponent);
		entity2.add(DummyComponent);
		entity3.add(DummyComponent);

		query.writer.add(entity1);
		query.writer.add(entity2);
		query.writer.add(entity3);

		const results = [];
		for (const entity of query.reader.all) {
			results.push(entity);
		}

		expect(results.length).toBe(3);
		expect(results).toMatchObject([entity1, entity2, entity3]);
	});

	it(`ignores non-matching entities while iterating over results.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'foo' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const entity3 = new Entity(scene, { queueForUpdate: () => {} });
		const entity4 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent1]);

		entity1.add(DummyComponent1);
		entity2.add(DummyComponent1);
		entity3.add(DummyComponent2);
		entity4.add(DummyComponent1);

		query.writer.add(entity1);
		query.writer.add(entity2);
		query.writer.add(entity3);
		query.writer.add(entity4);

		const results = [];
		for (const entity of query.reader.all) {
			results.push(entity);
		}

		expect(results.length).toBe(3);
		expect(results).toMatchObject([entity1, entity2, entity4]);
	});

	it(`tracks added components`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);
		let results: Entity[];

		entity.add(DummyComponent);

		// query.added should be initially empty
		results = [...query.reader.added];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// query.all should be initially empty
		results = [...query.reader.all];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// Add entity
		query.writer.add(entity);

		// query.added should contain entity
		results = [...query.reader.added];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity]);

		// query.all should contain entity
		results = [...query.reader.all];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity]);

		// Remove entity
		query.writer.remove(entity);

		// query.added should be empty
		results = [...query.reader.added];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// query.all should be empty
		results = [...query.reader.all];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// Add entity
		query.writer.add(entity);

		// query.added should contain entity
		results = [...query.reader.added];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity]);

		// query.all should contain entity
		results = [...query.reader.all];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity]);

		// Flush query writer
		query.writer.flush();

		// query.added should be empty
		results = [...query.reader.added];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// query.all should contain entity
		results = [...query.reader.all];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity]);
	});

	it(`tracks removed components`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const entity3 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);
		let results: Entity[];

		entity1.add(DummyComponent);
		entity2.add(DummyComponent);
		entity3.add(DummyComponent);

		// query.removed should be initially empty
		results = [...query.reader.removed];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// Add entity1, entity2 and entity3
		query.writer.add(entity1);
		query.writer.add(entity2);
		query.writer.add(entity3);

		// Flush query writer
		query.writer.flush();

		// query.all should contain entity1, entity2 and entity3
		results = [...query.reader.all];
		expect(results.length).toBe(3);
		expect(results).toMatchObject([entity1, entity2, entity3]);

		// query.removed should be empty
		results = [...query.reader.removed];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// Remove entity2
		query.writer.remove(entity2);

		// query.all should contain entity1 and entity3
		results = [...query.reader.all];
		expect(results.length).toBe(2);
		expect(results).toMatchObject([entity1, entity3]);

		// query.removed should contain entity2
		results = [...query.reader.removed];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity2]);

		// Flush query writer after removal
		query.writer.flush();

		// query.all should contain entity1 and entity3
		results = [...query.reader.all];
		expect(results.length).toBe(2);
		expect(results).toMatchObject([entity1, entity3]);

		// query.removed should be empty
		results = [...query.reader.removed];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// Remove entity1 and entity3
		query.writer.remove(entity1);
		query.writer.remove(entity3);

		// query.all should be empty
		results = [...query.reader.all];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// query.removed should contain entity1 and entity3
		results = [...query.reader.removed];
		expect(results.length).toBe(2);
		expect(results).toMatchObject([entity1, entity3]);

		// Flush query writer after removal
		query.writer.flush();

		// query.all should be empty
		results = [...query.reader.all];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// query.removed should be empty
		results = [...query.reader.removed];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);
	});

	it(`tracks unchanged components`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const entity3 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);
		let results: Entity[];

		entity1.add(DummyComponent);
		entity2.add(DummyComponent);
		entity3.add(DummyComponent);

		// query.unchanged should be initially empty
		results = [...query.reader.unchanged];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// Add entity1
		query.writer.add(entity1);

		// query.unchanged should be empty
		results = [...query.reader.unchanged];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);

		// Flush query writer
		query.writer.flush();

		// query.unchanged should contain only entity1
		results = [...query.reader.unchanged];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity1]);

		// Add entity2 and entity3
		query.writer.add(entity2);
		query.writer.add(entity3);

		// query.unchanged should contain only entity1
		results = [...query.reader.unchanged];
		expect(results.length).toBe(1);
		expect(results).toMatchObject([entity1]);

		// Flush query writer
		query.writer.flush();

		// query.unchanged should contain entity1, entity2 and entity3
		results = [...query.reader.unchanged];
		expect(results.length).toBe(3);
		expect(results).toMatchObject([entity1, entity2, entity3]);

		// Remove entity2
		query.writer.remove(entity2);

		// query.unchanged should contain entity1 and entity3
		results = [...query.reader.unchanged];
		expect(results.length).toBe(2);
		expect(results).toMatchObject([entity1, entity3]);

		// Remove entity1 and entity3
		query.writer.remove(entity1);
		query.writer.remove(entity3);

		// query.unchanged should be empty
		results = [...query.reader.unchanged];
		expect(results.length).toBe(0);
		expect(results).toMatchObject([]);
	});
});

describe('Query > Filter', () => {
	it(`filters by single component`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);

		entity1.add(DummyComponent);

		expect(query.matches(entity1)).toBe(true);
		expect(query.matches(entity2)).toBe(false);
	});

	it(`filters by multiple components`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		class DummyComponent3 { property = 'baz' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const entity3 = new Entity(scene, { queueForUpdate: () => {} });
		const entity4 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent1, DummyComponent3]);

		entity1.add(DummyComponent1).add(DummyComponent2);
		entity2.add(DummyComponent1).add(DummyComponent3);
		entity3.add(DummyComponent1);
		entity4.add(DummyComponent1).add(DummyComponent2).add(DummyComponent3);

		expect(query.matches(entity1)).toBe(false);
		expect(query.matches(entity2)).toBe(true);
		expect(query.matches(entity3)).toBe(false);
		expect(query.matches(entity4)).toBe(true);
	});

	it(`filters by single negation`, () => {
		class DummyComponent { property = 'foo' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([Not(DummyComponent)]);

		entity1.add(DummyComponent);

		expect(query.matches(entity1)).toBe(false);
		expect(query.matches(entity2)).toBe(true);
	});

	it(`filters by multiple negations`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		class DummyComponent3 { property = 'baz' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const entity3 = new Entity(scene, { queueForUpdate: () => {} });
		const entity4 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([Not(DummyComponent1), Not(DummyComponent3)]);

		entity1.add(DummyComponent1).add(DummyComponent2);
		entity2.add(DummyComponent1).add(DummyComponent3);
		entity3.add(DummyComponent2);
		entity4.add(DummyComponent1).add(DummyComponent2).add(DummyComponent3);

		expect(query.matches(entity1)).toBe(false);
		expect(query.matches(entity2)).toBe(false);
		expect(query.matches(entity3)).toBe(true);
		expect(query.matches(entity4)).toBe(false);
	});

	it(`filters by mixed components and negations`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		class DummyComponent3 { property = 'baz' }
		const scene = new Scene();
		const entity1 = new Entity(scene, { queueForUpdate: () => {} });
		const entity2 = new Entity(scene, { queueForUpdate: () => {} });
		const entity3 = new Entity(scene, { queueForUpdate: () => {} });
		const entity4 = new Entity(scene, { queueForUpdate: () => {} });
		const query = new Query([DummyComponent1, Not(DummyComponent3)]);

		entity1.add(DummyComponent1).add(DummyComponent2);
		entity2.add(DummyComponent1).add(DummyComponent3);
		entity3.add(DummyComponent2);
		entity4.add(DummyComponent1).add(DummyComponent2).add(DummyComponent3);

		expect(query.matches(entity1)).toBe(true);
		expect(query.matches(entity2)).toBe(false);
		expect(query.matches(entity3)).toBe(false);
		expect(query.matches(entity4)).toBe(false);
	});
});
