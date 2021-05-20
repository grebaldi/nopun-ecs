import { Not, Scene, System } from '../src';

describe('Simple Queries', () => {
	class Foo {
		value: string = 'initial'
	}

	class Bar {
		value: string = 'initial'
	}

	class Baz {
		value: string = 'initial'
	}

	class MySystem extends System {
		static queries = {
			withComponentFoo: [Foo, Not(Bar)],
			withComponentBar: [Bar, Not(Foo)],
			withComponentsFooAndBar: [Foo, Bar]
		};

		execute() {
			// Added
			for (const entity of this.queries.withComponentFoo.added) {
				entity.get(Foo).value = 'Foo was added';
			}

			for (const entity of this.queries.withComponentBar.added) {
				entity.get(Bar).value = 'Bar was added';
			}

			for (const entity of this.queries.withComponentsFooAndBar.added) {
				entity.get(Foo).value = 'Foo and Bar were added';
				entity.get(Bar).value = 'Foo and Bar were added';
			}

			// Unchanged
			for (const entity of this.queries.withComponentFoo.unchanged) {
				entity.get(Foo).value = 'Foo was unchanged';
			}

			for (const entity of this.queries.withComponentBar.unchanged) {
				entity.get(Bar).value = 'Bar was unchanged';
			}

			for (const entity of this.queries.withComponentsFooAndBar.unchanged) {
				entity.get(Foo).value = 'Foo and Bar were unchanged';
				entity.get(Bar).value = 'Foo and Bar were unchanged';
			}

			// Removed
			for (const entity of this.queries.withComponentFoo.removed) {
				entity.add(Baz, {value: 'Foo was removed'});
			}

			for (const entity of this.queries.withComponentBar.removed) {
				entity.add(Baz, {value: 'Bar was removed'});
			}

			for (const entity of this.queries.withComponentsFooAndBar.removed) {
				if (entity.has(Baz)) {
					entity.update(Baz, {value: 'Foo and Bar were removed'});
				} else {
					entity.add(Baz, {value: 'Foo and Bar were removed'});
				}
			}
		}
	}

	const scene = new Scene();

	scene.systems.register(MySystem);

	const hasFoo = scene.entities.create().add(Foo);
	const hasBar = scene.entities.create().add(Bar);
	const hasBaz = scene.entities.create().add(Baz);
	const hasFooAndBar = scene.entities.create().add(Foo).add(Bar);
	const hasFooAndBaz = scene.entities.create().add(Foo).add(Baz);
	const hasBarAndBaz = scene.entities.create().add(Bar).add(Baz);
	const hasFooAndBarAndBaz = scene.entities.create().add(Foo).add(Bar).add(Baz);

	it('recognizes added entities', () => {
		scene.execute(1);

		expect(hasFoo.get(Foo).value).toBe('Foo was added');
		expect(hasBar.get(Bar).value).toBe('Bar was added');
		expect(hasBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBar.get(Foo).value).toBe('Foo and Bar were added');
		expect(hasFooAndBar.get(Bar).value).toBe('Foo and Bar were added');

		expect(hasFooAndBaz.get(Foo).value).toBe('Foo was added');
		expect(hasFooAndBaz.get(Baz).value).toBe('initial');

		expect(hasBarAndBaz.get(Bar).value).toBe('Bar was added');
		expect(hasBarAndBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBarAndBaz.get(Foo).value).toBe('Foo and Bar were added');
		expect(hasFooAndBarAndBaz.get(Bar).value).toBe('Foo and Bar were added');
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('initial');
	});

	it('recognizes unchanged entities', () => {
		scene.execute(2);

		expect(hasFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasBar.get(Bar).value).toBe('Bar was unchanged');
		expect(hasBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBar.get(Foo).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBar.get(Bar).value).toBe('Foo and Bar were unchanged');

		expect(hasFooAndBaz.get(Foo).value).toBe('Foo was unchanged');
		expect(hasFooAndBaz.get(Baz).value).toBe('initial');

		expect(hasBarAndBaz.get(Bar).value).toBe('Bar was unchanged');
		expect(hasBarAndBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBarAndBaz.get(Foo).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBarAndBaz.get(Bar).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('initial');
	});

	it('recognizes removed entities', () => {
		hasFooAndBar.remove(Foo).remove(Bar);
		scene.execute(3);

		expect(hasFoo.get(Foo).value).toBe('Foo was unchanged');
		expect(hasBar.get(Bar).value).toBe('Bar was unchanged');
		expect(hasBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBar.has(Foo)).toBe(false);
		expect(hasFooAndBar.has(Bar)).toBe(false);
		expect(hasFooAndBar.get(Baz).value).toBe('Foo and Bar were removed');

		expect(hasFooAndBaz.get(Foo).value).toBe('Foo was unchanged');
		expect(hasFooAndBaz.get(Baz).value).toBe('initial');

		expect(hasBarAndBaz.get(Bar).value).toBe('Bar was unchanged');
		expect(hasBarAndBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBarAndBaz.get(Foo).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBarAndBaz.get(Bar).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('initial');

		hasFoo.remove(Foo);
		hasBar.remove(Bar);
		scene.execute(4);

		expect(hasFoo.has(Foo)).toBe(false);
		expect(hasFoo.get(Baz).value).toBe('Foo was removed');
		expect(hasBar.has(Foo)).toBe(false);
		expect(hasBar.get(Baz).value).toBe('Bar was removed');
		expect(hasBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBar.has(Foo)).toBe(false);
		expect(hasFooAndBar.has(Bar)).toBe(false);
		expect(hasFooAndBar.get(Baz).value).toBe('Foo and Bar were removed');

		expect(hasFooAndBaz.get(Foo).value).toBe('Foo was unchanged');
		expect(hasFooAndBaz.get(Baz).value).toBe('initial');

		expect(hasBarAndBaz.get(Bar).value).toBe('Bar was unchanged');
		expect(hasBarAndBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBarAndBaz.get(Foo).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBarAndBaz.get(Bar).value).toBe('Foo and Bar were unchanged');
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('initial');

		hasFooAndBarAndBaz.remove(Foo).remove(Bar);
		scene.execute(5);

		expect(hasFoo.has(Foo)).toBe(false);
		expect(hasFoo.get(Baz).value).toBe('Foo was removed');
		expect(hasBar.has(Foo)).toBe(false);
		expect(hasBar.get(Baz).value).toBe('Bar was removed');
		expect(hasBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBar.has(Foo)).toBe(false);
		expect(hasFooAndBar.has(Bar)).toBe(false);
		expect(hasFooAndBar.get(Baz).value).toBe('Foo and Bar were removed');

		expect(hasFooAndBaz.get(Foo).value).toBe('Foo was unchanged');
		expect(hasFooAndBaz.get(Baz).value).toBe('initial');

		expect(hasBarAndBaz.get(Bar).value).toBe('Bar was unchanged');
		expect(hasBarAndBaz.get(Baz).value).toBe('initial');

		expect(hasFooAndBarAndBaz.has(Foo)).toBe(false);
		expect(hasFooAndBarAndBaz.has(Bar)).toBe(false);
		expect(hasFooAndBarAndBaz.get(Baz).value).toBe('Foo and Bar were removed');
	});
});
