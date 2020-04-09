import { Entity } from "./Entity";
import { Query } from "./Query";
import { Not } from "./Filter";

describe('Query > Writer', () => {
	it(`stores matching entities.`, () => {
		class DummyComponent { property = 'foo' }
		const entity = new Entity({ queueForUpdate: () => {} });
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
		const entity = new Entity({ queueForUpdate: () => {} });
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
		const entity = new Entity({ queueForUpdate: () => {} });
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
		const entity = new Entity({ queueForUpdate: () => {} });
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
		const entity1 = new Entity({ queueForUpdate: () => {} });
		const entity2 = new Entity({ queueForUpdate: () => {} });
		const entity3 = new Entity({ queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);

		entity1.add(DummyComponent);
		entity2.add(DummyComponent);
		entity3.add(DummyComponent);

		query.writer.add(entity1);
		query.writer.add(entity2);
		query.writer.add(entity3);

		const results = [];
		for (const entity of query.reader.results) {
			results.push(entity);
		}

		expect(results.length).toBe(3);
		expect(results).toMatchObject([entity1, entity2, entity3]);
	});

	it(`ignores non-matching entities while iterating over results.`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'foo' }
		const entity1 = new Entity({ queueForUpdate: () => {} });
		const entity2 = new Entity({ queueForUpdate: () => {} });
		const entity3 = new Entity({ queueForUpdate: () => {} });
		const entity4 = new Entity({ queueForUpdate: () => {} });
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
		for (const entity of query.reader.results) {
			results.push(entity);
		}

		expect(results.length).toBe(3);
		expect(results).toMatchObject([entity1, entity2, entity4]);
	});
});

describe('Query > Filter', () => {
	it(`filters by single component`, () => {
		class DummyComponent { property = 'foo' }
		const entity1 = new Entity({ queueForUpdate: () => {} });
		const entity2 = new Entity({ queueForUpdate: () => {} });
		const query = new Query([DummyComponent]);

		entity1.add(DummyComponent);

		expect(query.matches(entity1)).toBe(true);
		expect(query.matches(entity2)).toBe(false);
	});

	it(`filters by multiple components`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		class DummyComponent3 { property = 'baz' }
		const entity1 = new Entity({ queueForUpdate: () => {} });
		const entity2 = new Entity({ queueForUpdate: () => {} });
		const entity3 = new Entity({ queueForUpdate: () => {} });
		const entity4 = new Entity({ queueForUpdate: () => {} });
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
		const entity1 = new Entity({ queueForUpdate: () => {} });
		const entity2 = new Entity({ queueForUpdate: () => {} });
		const query = new Query([Not(DummyComponent)]);

		entity1.add(DummyComponent);

		expect(query.matches(entity1)).toBe(false);
		expect(query.matches(entity2)).toBe(true);
	});

	it(`filters by multiple negations`, () => {
		class DummyComponent1 { property = 'foo' }
		class DummyComponent2 { property = 'bar' }
		class DummyComponent3 { property = 'baz' }
		const entity1 = new Entity({ queueForUpdate: () => {} });
		const entity2 = new Entity({ queueForUpdate: () => {} });
		const entity3 = new Entity({ queueForUpdate: () => {} });
		const entity4 = new Entity({ queueForUpdate: () => {} });
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
		const entity1 = new Entity({ queueForUpdate: () => {} });
		const entity2 = new Entity({ queueForUpdate: () => {} });
		const entity3 = new Entity({ queueForUpdate: () => {} });
		const entity4 = new Entity({ queueForUpdate: () => {} });
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
})
