import { Scene, System, Or, Not } from '../src';

describe('Complex Queries: Or', () => {
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
			withFooOrBar: [Or(Foo, Bar)],
			WithNeitherFooNorBar: [Not(Or(Foo, Bar))]
		}

		execute() {
			for (const entity of this.queries.withFooOrBar.added) {
				for (const [foo] of entity.take(Foo)) {
					foo.value = 'Foo was added';
				}
				for (const [bar] of entity.take(Bar)) {
					bar.value = 'Bar was added';
				}
			}

			for (const entity of this.queries.withFooOrBar.unchanged) {
				for (const [foo] of entity.take(Foo)) {
					foo.value = 'Foo was unchanged';
				}
				for (const [bar] of entity.take(Bar)) {
					bar.value = 'Bar was unchanged';
				}
			}

			for (const entity of this.queries.withFooOrBar.removed) {
				entity.add(Baz, { value: 'Foo and Bar were removed' });
			}

			for (const entity of this.queries.WithNeitherFooNorBar.removed) {
				entity.update(Baz, { value: 'Foo or Bar was added' });
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

		expect(hasFooAndBar.get(Foo).value).toBe('Foo was added');
		expect(hasFooAndBar.get(Bar).value).toBe('Bar was added');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes unchanged entities', () => {
		scene.execute(3);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.get(Foo).value).toBe('Foo was unchanged');
		expect(hasFooAndBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('does not react when an entity lost a compoenent but still matches the disjunction', () => {
		hasFooAndBar.remove(Bar);
		scene.execute(4);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.get(Foo).value).toBe('Foo was unchanged');
		expect(hasFooAndBar.has(Bar)).toBe(false);

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes when an entity lost enough components to not match the disjunction anymore', () => {
		hasFooAndBar.remove(Foo);
		scene.execute(5);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.has(Foo)).toBe(false);
		expect(hasFooAndBar.has(Bar)).toBe(false);
		expect(hasFooAndBar.get(Baz).value).toBe('Foo and Bar were removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');

		hasOnlyFoo.remove(Foo);
		scene.execute(6);

		expect(hasOnlyFoo.has(Foo)).toBe(false);
		expect(hasOnlyFoo.get(Baz).value).toBe('Foo and Bar were removed');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.has(Foo)).toBe(false);
		expect(hasFooAndBar.has(Bar)).toBe(false);
		expect(hasFooAndBar.get(Baz).value).toBe('Foo and Bar were removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');

		hasOnlyBar.remove(Bar);
		scene.execute(7);

		expect(hasOnlyFoo.has(Foo)).toBe(false);
		expect(hasOnlyFoo.get(Baz).value).toBe('Foo and Bar were removed');
		expect(hasOnlyBar.has(Bar)).toBe(false);
		expect(hasOnlyBar.get(Baz).value).toBe('Foo and Bar were removed');

		expect(hasFooAndBar.has(Foo)).toBe(false);
		expect(hasFooAndBar.has(Bar)).toBe(false);
		expect(hasFooAndBar.get(Baz).value).toBe('Foo and Bar were removed');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes when an entity gained enough components to match the disjunction.', () => {
		hasNeitherFooNorBar.add(Foo);
		scene.execute(8);

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('Foo or Bar was added');
		expect(hasNeitherFooNorBar.get(Foo).value).toBe('Foo was added');
	});
});
