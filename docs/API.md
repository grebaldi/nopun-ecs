# nopun-ecs API

## Scene

### Creating a scene

Scenes can be created via `new`.

**EXAMPLE:**
```typescript
import { Scene } from "nopun-ecs";

const myScene = new Scene();
```

You may also extend a scene.

**EXAMPLE:**
```typescript
import { Scene } from "nopun-ecs";

class MyScene extends Scene {
}

const myScene = new MyScene();
```

The scene constructor takes no parameters.

### `scene.initialize(): void`

This method can be overridden to implement custom initialization logic.

**EXAMPLE:**
```typescript
import { Scene, Entity } from "nopun-ecs";

class MyScene extends Scene {
    private player: Entity;

    initialize() {
        this.player = this.entities.create();
    }
}
```

### `scene.destroy(): void`

This will call the `destroy`-method of all systems. Also, it could be used to implement custom cleanup logic, but remember to call `super.destroy()` within your custom method, so all systems can free their resources.

**EXAMPLE:**
```typescript
scene.destroy();
```

### `scene.resources.add(RC: ResourceConstructor, initialValue?: object): Resource`

Resources are - like components - just data containers. They are not bound to an entity but to the scene itself, so you can use them to store central data.

A resource can be added to the scene via the resource constructor. There can only ever be one resource instance per resource type within one scene.

**EXAMPLE:**
```typescript
import { Scene } from "nopun-ecs";

// Resources are just plain objects, similar to components
class CameraPosition2D {
    x: number = 0;
    y: number = 0;
}

const scene = new Scene();

scene.resources.add(CameraPosition2D);
```

Resources can be provided with an initial value when they're added.

**EXAMPLE:**
```typescript
scene.resources.add(CameraPosition2D, {
    x: 32,
    y: 64
});
```

This method will throw an error on the attempt of adding the same resource twice.

### `scene.resources.remove(RC: ResourceConstructor): void`

An existing resource can be removed from a scene at any point during runtime.

**EXAMPLE:**
```typescript
scene.resources.remove(CameraPosition2D);
```

This method will throw an error on the attempt of removing a resource that has not been added before.

### `scene.resources.get(RC: ResourceConstructor): Resource`

The data of a resource can be obtained via this method.

**EXAMPLE:**
```typescript
const { x, y } = scene.resources.get(CameraPosition2D);
```

This method will throw an error on the attempt of accessing a resource that has not been added before.

### `scene.systems.register(SC: SystemConstructor): void`

Systems are registered to a scene via their constructor. The order in which systems are registered matters, because they are executed in that order.

There can only ever be one system instance per system type within one scene.

**EXAMPLE:**
```typescript
import { Scene } from "nopun-ecs";
import { MySystem } from "./MySystem";

const scene = new Scene();

scene.systems.register(MySystem);
```

This method will throw an error on the attempt of registering a system that has been registered already.

### `scene.systems.unregister(SC: SystemConstructor): void`

An existing resource can be removed from a scene at any point during runtime.

**EXAMPLE:**
```typescript
scene.systems.unregister(MySystem);
```

This method will throw an error on the attempt of unregistering a system that has not been registered before.

### `scene.entities.create(): Entity`

This is the only method allowed to create Entities.

**EXAMPLE:**
```typescript
import { Scene } from "nopun-ecs";

const scene = new Scene();
const player = scene.entities.create();
const opponent = scene.entities.create();
```

For a more elaborate example on entity creation have a look at the Entity section down below.

### `scene.entities.exists(entity: Entity): boolean`

This method checks whether a given entity exists in a scene.

**EXAMPLE:**
```typescript
if (!scene.entities.exists(player)) {
    console.log('player is gone');
}
```

### `scene.entities.destroy(entity: Entity): void`

With this method an entity can be removed permanently from a scene. Once destroyed, there's no way for the entity to get back into the scene.

**EXAMPLE:**
```typescript
scene.entities.destroy(opponent);
```

This method will throw an error on the attempt of destroying an entity that does not exist within the scene.

### `scene.execute(deltaTime: number): void`

This method needs to be called from inside a game loop. The parameter `deltaTime` is supposed to carry the time difference between frames as provided by your game framework of choice or a custom implementation as shown below.

**EXAMPLE:**
```typescript
import { Scene } from "nopun-ecs";

const scene = new Scene();

let start = Date.now();
function run() {
    const current = Date.now();
    const delta = current - start;
    start = current;

    scene.execute(delta);
    requestAnimationFrame(run);
}

run();
```

## Component

Components are plain objects that are supposed to only hold data. In theory any class with a constructor that takes no parameters can be used as a component.

Components **must** be expressed as classes, because their constructor is used as an identifier. Providing anything else will result in unexcpected behavior and should already be prevented by static typing.

**EXAMPLE:**
```typescript
class Position2D {
    x: number;
    y: number;
}

class Rectangle {
    width: number;
    height: number;
}
```

## Entity

Entities are distinct objects in a scene. They are containers for a set of components and themselves only references, that do not hold any data of their own.

### Creating an entity

Entities can only be created via a scene. They provide a fluent interface to attach and remove components.

**EXAMPLE:**
```typescript
import { Scene } from "nopun-ecs";

const scene = new Scene();

scene.entities.create()
    .add(Position, { x: 32, y: 64 })
    .add(Velocity, { vx: 1, vy: 0 });
```

### `entity.add(CC: ComponentConstructor, initialValue?: object): Entity`

A component can be added to an entity via the component constructor. There can only ever be one component instance per component type within one scene.

**EXAMPLE**
```typescript
scene.entities.create()
    .add(MyComponent);
```

Components can be provided with an initial value when they're added.

**EXAMPLE**
```typescript
const myEntity = scene.entities.create()
    .add(My3DPositionComponent, {
        x: 32,
        y: 64,
        z: 128
    });
```

This method will throw an error on the attempt of adding the same component twice.

### `entity.update(CC: ComponentConstructor, value?: object): Entity`

This method overrides the value of an already added component.

**EXAMPLE**
```typescript
myEntity
    .update(My3DPositionComponent, {
        x: 64
    });
```

This method will throw an error on the attempt of updating a component that has not been added before.

### `entity.get(CC: ComponentConstructor): Component`

The data of a component can be obtained via this method.

**EXAMPLE:**
```typescript
const { x, y, z } = myEntity.get(My3DPositionComponent);
```

This method will throw an error on the attempt of accessing a component that has not been added before.

### `entity.has(CC: ComponentConstructor): boolean`

This method will check whether the given component is attached to this entity.

**EXAMPLE:**
```typescript
if (myEntity.has(My3DPositionComponent)) {
    console.log('This entity has a position in 3D space.');
}
```

### `entity.remove(CC: ComponentConstructor): Entity`

An existing component can be removed from an entity at any point during runtime.

**EXAMPLE:**
```typescript
myEntity.remove(My3DPositionComponent);
```

This method will throw an error on the attempt of removing a component that has not been added before.

## System

Systems manipulate component data by querying for entities based on their components.

### Defining a system

A system is a class that extends the `System`-class provided by nopun-ecs. It must implement the `execute` method and may define queries via the static `queries` property.

**EXAMPLE:**
```typescript
import { System } from "nopun-ecs";

class MovementSystem extends System {
    static queries = {
        movables: [Position, Velocity]
    };

    execute(dt: number) {
        for (const movable of this.queries.movables.all) {
            // ...
        }
    }
}
```

### `(static) System.queries`

The static `queries` property on the `System` class can be used to define filter criteria and query for entities based on their components.

`queries` has to be defined as a hashmap with keys being strings and values being an array of either component constructors or negations.

**EXAMPLE:**
```typescript
class MovementSystem extends System {
    static queries = {
        movables: [Position, Velocity]
    };
}
```

Negations can be expressed via the `Not`-function.

**EXAMPLE:**
```typescript
import { System, Not } from "nopun-ecs";

class MovementSystem extends System {
    static queries = {
        movables: [Position, Velocity],
        immovables: [Position, Not(Velocity)]
    };
}
```

When a system is registered to a scene, nopun-ecs takes care of compiling the here defined queries, so that their results can be accessed during execution of the system.

### `(system) this.initialize(): void`

The `initialize` method is called once when the system is registered to a scene. This would be place to execute any side-effect logic to set up the system.

**EXAMPLE:**
```typescript
class MySystem extends System {
    /* ... */

    initialize() {
        document.addEventListener(/* ... */);
    }
}
```

### `(system) this.destroy(): void`

The `destroy` method is called when the system is unregistered from a scene or when the scene itself gets destroyed. This would be place to clean up and free any resources claimed in the `initialize` method.

**EXAMPLE:**
```typescript
class MySystem extends System {
    /* ... */

    destroy() {
        document.removeEventListener(/* ... */);
    }
}
```

### `(system) this.execute(deltaTime: number): void`

This method is supposed to contain the main logic of a system. It gets executed on every frame. The `deltaTime` parameter contains the current delta time as passed to the scene's `execute` method.

**EXAMPLE:**
```typescript
class MySystem extends System {
    execute(dt: number) {
        for (const entity of this.queries.someQuery.all) {
            /* ... */
        }
    }
}
```

### `(system) this.queries.[name].all: Iterable<Entity>`

This property provides access to a list of all entities that match the query `[name]` as defined in the system's static `queries` property.

**EXAMPLE:**
```typescript
class MovementSystem extends System {
    static queries = {
        movables: [Position, Velocity]
    };

    execute(dt: number) {
        for (const movable of this.queries.movables.all) {
            // `movable` is guaranteed to have `Position` and `Velocity` components
        }
    }
}
```

### `(system) this.queries.[name].added: Iterable<Entity>`

Same as `this.queries.[name].all`, but contains only recently added entities.

### `(system) this.queries.[name].removed: Iterable<Entity>`

Same as `this.queries.[name].all`, but contains only recently removed entities.

### `(system) this.queries.[name].unchanged: Iterable<Entity>`

Same as `this.queries.[name].all`, but contains only entities that have neither been added nor removed recently.

### `(system) this.scene: Scene`

This property provides access to the scene that this system has been registered to.
