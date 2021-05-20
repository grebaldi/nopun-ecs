import { Scene, System, And, Or, Xor, Not } from '../src';

describe('Complex Queries: Everything', () => {
	class Foo {
		value: string = 'initial Foo'
	}

	class Bar {
		value: string = 'initial Bar'
	}

	class Baz {
		value: string = 'initial Baz'
	}

	class Qux {
		value: string = 'initial Qux'
	}

	class Removed {
	}

	class MySystem extends System {
		static queries = {
			matches: [Xor(And(Foo, Bar), And(Foo, Baz), Not(Or(Foo, Bar, Baz)), Not(Baz))]
		}

		execute() {
			for (const entity of this.queries.matches.added) {
				for (const [foo] of entity.take(Foo)) {
					foo.value = 'Foo was added';
				}
				for (const [bar] of entity.take(Bar)) {
					bar.value = 'Bar was added';
				}
				for (const [baz] of entity.take(Baz)) {
					baz.value = 'Baz was added';
				}
				for (const [qux] of entity.take(Qux)) {
					qux.value = 'Qux was added';
				}
			}

			for (const entity of this.queries.matches.unchanged) {
				for (const [foo] of entity.take(Foo)) {
					foo.value = 'Foo was unchanged';
				}
				for (const [bar] of entity.take(Bar)) {
					bar.value = 'Bar was unchanged';
				}
				for (const [baz] of entity.take(Baz)) {
					baz.value = 'Baz was unchanged';
				}
				for (const [qux] of entity.take(Qux)) {
					qux.value = 'Qux was unchanged';
				}
			}

			for (const entity of this.queries.matches.removed) {
				entity.add(Removed);
			}
		}
	}

	const scene = new Scene();

	scene.systems.register(MySystem);

	const hasOnlyFoo = scene.entities.create().add(Foo);
	const hasOnlyBar = scene.entities.create().add(Bar);
	const hasOnlyBaz = scene.entities.create().add(Baz);
	const hasOnlyQux = scene.entities.create().add(Qux);
	const hasFooAndBar = scene.entities.create().add(Foo).add(Bar);
	const hasFooAndBaz = scene.entities.create().add(Foo).add(Baz);
	const hasFooAndQux = scene.entities.create().add(Foo).add(Qux);
	const hasBarAndBaz = scene.entities.create().add(Bar).add(Baz);
	const hasFooAndBarAndBaz = scene.entities.create().add(Foo).add(Bar).add(Baz);

	it('recognizes added entities', () => {
		scene.execute(1);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was added'); // matches only Not(Baz)
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was added'); // matches only Not(Baz)
		expect(hasOnlyBaz.get(Baz).value).toBe('initial Baz'); // matches nothing
		expect(hasOnlyQux.get(Qux).value).toBe('initial Qux'); // matches Not(Or(Foo, Bar, Baz)) as well as Not(Baz)

		expect(hasFooAndBar.get(Foo).value).toBe('initial Foo'); // matches And(Foo, Bar) as well as Not(Baz)
		expect(hasFooAndBar.get(Bar).value).toBe('initial Bar');

		expect(hasFooAndBaz.get(Foo).value).toBe('Foo was added'); // matches And(Foo, Baz)
		expect(hasFooAndBaz.get(Baz).value).toBe('Baz was added');

		expect(hasFooAndQux.get(Foo).value).toBe('Foo was added'); // matches Not(Baz)
		expect(hasFooAndQux.get(Qux).value).toBe('Qux was added');

		expect(hasBarAndBaz.get(Bar).value).toBe('initial Bar'); // matches nothing
		expect(hasBarAndBaz.get(Baz).value).toBe('initial Baz');

		expect(hasFooAndBarAndBaz.get(Foo).value).toBe('initial Foo'); // matches And(Foo, Bar) as well as And(Foo, Baz)
		expect(hasFooAndBarAndBaz.get(Bar).value).toBe('initial Bar');
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes unchanged entities', () => {
		scene.execute(2);

		expect(hasOnlyFoo.get(Foo).value).toBe('Foo was unchanged'); // matches only Not(Baz)
		expect(hasOnlyBar.get(Bar).value).toBe('Bar was unchanged'); // matches only Not(Baz)
		expect(hasOnlyBaz.get(Baz).value).toBe('initial Baz'); // matches nothing
		expect(hasOnlyQux.get(Qux).value).toBe('initial Qux'); // matches Not(Or(Foo, Bar, Baz)) as well as Not(Baz)

		expect(hasFooAndBar.get(Foo).value).toBe('initial Foo'); // matches And(Foo, Bar) as well as Not(Baz)
		expect(hasFooAndBar.get(Bar).value).toBe('initial Bar');

		expect(hasFooAndBaz.get(Foo).value).toBe('Foo was unchanged'); // matches only And(Foo, Baz)
		expect(hasFooAndBaz.get(Baz).value).toBe('Baz was unchanged');

		expect(hasFooAndQux.get(Foo).value).toBe('Foo was unchanged'); // matches only Not(Baz)
		expect(hasFooAndQux.get(Qux).value).toBe('Qux was unchanged');

		expect(hasBarAndBaz.get(Bar).value).toBe('initial Bar'); // matches nothing
		expect(hasBarAndBaz.get(Baz).value).toBe('initial Baz');

		expect(hasFooAndBarAndBaz.get(Foo).value).toBe('initial Foo'); // matches And(Foo, Bar) as well as And(Foo, Baz)
		expect(hasFooAndBarAndBaz.get(Bar).value).toBe('initial Bar');
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('initial Baz');
	});

	it('does nothing if a non-matching entity loses components and still does not match the query condition', () => {
		hasBarAndBaz.remove(Bar);
		scene.execute(3);

		expect(hasBarAndBaz.has(Bar)).toBe(false);
		expect(hasBarAndBaz.get(Baz).value).toBe('initial Baz'); // matches nothing
	});

	it('does noting if a non-matching entity gains components and still does not match the query condition', () => {
		hasFooAndBar.add(Baz);
		scene.execute(4);

		expect(hasFooAndBar.get(Foo).value).toBe('initial Foo'); // matches And(Foo, Bar) as well as And(Foo, Baz)
		expect(hasFooAndBar.get(Bar).value).toBe('initial Bar');
		expect(hasFooAndBar.get(Baz).value).toBe('initial Baz');
	});

	it('recognizes if a component loses enough components to not match the query condition anymore', () => {
		hasFooAndBaz.remove(Foo);
		scene.execute(5);

		expect(hasFooAndBaz.has(Foo)).toBe(false);
		expect(hasFooAndBaz.get(Baz).value).toBe('Baz was unchanged');
		expect(hasFooAndBaz.has(Removed)).toBe(true);
	});

	it('recognizes if a component gains enough components to not match the query condition anymore', () => {
		hasOnlyBar.remove(Bar);
		scene.execute(6);

		expect(hasOnlyBar.has(Bar)).toBe(false);
		expect(hasOnlyBar.has(Removed)).toBe(true);
	});

	it('recognizes if a component gains enough components to now match the query condition', () => {
		hasOnlyBaz.add(Foo);
		scene.execute(7);

		expect(hasOnlyBaz.get(Foo).value).toBe('Foo was added');
		expect(hasOnlyBaz.get(Baz).value).toBe('Baz was added');
	});

	it('recognizes if a component loses enough components to now match the query condition', () => {
		hasFooAndBarAndBaz.remove(Bar);
		scene.execute(8);

		expect(hasFooAndBarAndBaz.get(Foo).value).toBe('Foo was added');
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('Baz was added');
	});
});
