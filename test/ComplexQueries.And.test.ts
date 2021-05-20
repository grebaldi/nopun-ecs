import { Scene, System, And, Not } from '../src';

describe('Complex Queries: And', () => {
	class Foo {
		value: string = 'initial Foo'
	}

	class Bar {
		value: string = 'initial Bar'
	}

	class Baz {
		value: string = 'initial Baz'
	}

	class MySystem extends System {
		static queries = {
			withFoo: [And(Foo)],
			withOnlyBar: [And(Bar, Not(Foo))],
			withFooAndBar: [And(Foo, Bar)],
			withNeitherFooNorBar: [And(Not(Foo), Not(Bar))]
		}

		execute() {
			// Added
			for (const entity of this.queries.withFoo.added) {
				entity.get(Foo).value = 'Foo was added';
			}

			for (const entity of this.queries.withOnlyBar.added) {
				entity.get(Bar).value = 'Bar was added';
			}

			for (const entity of this.queries.withFooAndBar.added) {
				entity.get(Foo).value = 'Foo and Bar were added';
				entity.get(Bar).value = 'Foo and Bar were added';
			}

			// Unchanged
			for (const entity of this.queries.withFoo.unchanged) {
				entity.get(Foo).value = 'Foo was unchanged';
			}

			for (const entity of this.queries.withOnlyBar.unchanged) {
				entity.get(Bar).value = 'Bar was unchanged';
			}

			for (const entity of this.queries.withFooAndBar.unchanged) {
				entity.get(Foo).value = 'Foo and Bar were unchanged';
				entity.get(Bar).value = 'Foo and Bar were unchanged';
			}

			// Removed
			for (const entity of this.queries.withFoo.removed) {
				entity.add(Baz, { value: 'Foo was removed' });
			}

			for (const entity of this.queries.withOnlyBar.removed) {
				entity.put(Baz, { value: 'Bar was removed' });
			}

			for (const entity of this.queries.withNeitherFooNorBar.removed) {
				entity.get(Baz).value = 'A Foo or a Bar was added';
			}
		}
	}

	const scene = new Scene();

	scene.systems.register(MySystem);

	const hasOnlyFoo = scene.entities.create().add(Foo);
	const hasOnlyBar = scene.entities.create().add(Bar);
	const hasFooAndBar = scene.entities.create().add(Foo).add(Bar);
	const hasNeitherFooNorBar = scene.entities.create().add(Baz);

	it('recognizes added entities', () => {
		scene.execute(1);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was added');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was added');

		expect(hasFooAndBar.get(Foo).value).toBe('Foo and Bar were added');
		expect(hasFooAndBar.get(Bar).value).toBe('Foo and Bar were added');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes unchanged entities', () => {
		scene.execute(2);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.get(Foo).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBar.get(Bar).value).toBe('Foo and Bar were unchanged');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes removed entities', () => {
		hasFooAndBar.remove(Foo);
		scene.execute(3);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.get(Bar).value).toBe('Bar was added');
		expect(hasFooAndBar.get(Baz).value).toBe('Foo was removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');

		hasFooAndBar.remove(Bar);
		scene.execute(4);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.get(Baz).value).toBe('Bar was removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');

		hasOnlyFoo.remove(Foo);
		scene.execute(5);

		expect(hasOnlyFoo.has(Foo)).toBe(false);
		expect(hasOnlyFoo.get(Baz).value).toBe('Foo was removed');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.get(Baz).value).toBe('Bar was removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');

		hasOnlyBar.remove(Bar);
		scene.execute(6);

		expect(hasOnlyFoo.has(Foo)).toBe(false);
		expect(hasOnlyFoo.get(Baz).value).toBe('Foo was removed');
		expect(hasOnlyBar.has(Bar)).toBe(false);
		expect(hasOnlyBar.get(Baz).value).toBe('Bar was removed');

		expect(hasFooAndBar.get(Baz).value).toBe('Bar was removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');

		hasNeitherFooNorBar.add(Foo);
		scene.execute(7);

		expect(hasOnlyFoo.has(Foo)).toBe(false);
		expect(hasOnlyFoo.get(Baz).value).toBe('Foo was removed');
		expect(hasOnlyBar.has(Bar)).toBe(false);
		expect(hasOnlyBar.get(Baz).value).toBe('Bar was removed');

		expect(hasFooAndBar.get(Baz).value).toBe('Bar was removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('A Foo or a Bar was added');
		expect(hasNeitherFooNorBar.get(Foo).value).toBe('Foo was added');
	});
});
