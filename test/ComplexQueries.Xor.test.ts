import { Scene, System, Xor, Not } from '../src';

describe('Complex Queries: Xor', () => {
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
			withEitherFooOrBar: [Xor(Foo, Bar)],
			withBothOrNone: [Not(Xor(Foo, Bar))]
		}

		execute() {
			for (const entity of this.queries.withEitherFooOrBar.added) {
				for (const [foo] of entity.take(Foo)) {
					foo.value = 'Foo was added';
				}
				for (const [bar] of entity.take(Bar)) {
					bar.value = 'Bar was added';
				}
			}

			for (const entity of this.queries.withEitherFooOrBar.unchanged) {
				for (const [foo] of entity.take(Foo)) {
					foo.value = 'Foo was unchanged';
				}
				for (const [bar] of entity.take(Bar)) {
					bar.value = 'Bar was unchanged';
				}
			}

			for (const entity of this.queries.withEitherFooOrBar.removed) {
				if (entity.has(Foo) || entity.has(Bar)) {
					entity.add(Baz, { value: 'Foo or Bar was added' });
				} else {
					entity.add(Baz, { value: 'Foo or Bar was removed' });
				}
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

		expect(hasFooAndBar.get(Foo).value).toBe('initial Foo');
		expect(hasFooAndBar.get(Bar).value).toBe('initial Bar');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes unchanged entities', () => {
		scene.execute(3);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged');

		expect(hasFooAndBar.get(Foo).value).toBe('initial Foo');
		expect(hasFooAndBar.get(Bar).value).toBe('initial Bar');

		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes when an entity lost enough components to not match the exclusive disjunction anymore', () => {
		hasOnlyFoo.remove(Foo);
		scene.execute(4);

		expect(hasOnlyFoo.has(Foo)).toBe(false);
		expect(hasOnlyFoo.get(Baz).value).toBe('Foo or Bar was removed');
	});

	it('recognizes when an entity gained enough components to not match the exclusive disjunction anymore', () => {
		hasOnlyBar.add(Foo);
		scene.execute(4);

		expect(hasOnlyBar.has(Foo)).toBe(true);
		expect(hasOnlyBar.get(Foo).value).toBe('initial Foo');
		expect(hasOnlyBar.get(Baz).value).toBe('Foo or Bar was added');
	});

	it('recognizes when an entity gained enough components to match the exclusive disjunctions', () => {
		hasNeitherFooNorBar.add(Bar);
		scene.execute(4);

		expect(hasNeitherFooNorBar.has(Bar)).toBe(true);
		expect(hasNeitherFooNorBar.get(Bar).value).toBe('Bar was added');
		expect(hasNeitherFooNorBar.get(Baz).value).toBe('initial Baz');
	});
});
