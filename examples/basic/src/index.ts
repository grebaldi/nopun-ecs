// Actually: import { System, Scene } from "nopun-ecs";
import { System, Scene } from "../../../dist";

/* COMPONENTS */
class Position2D {
    // Components are just plain objects that hold data
    x: number = 0;
    y: number = 0;
}

class Velocity2D {
    // Strictly speaking, Velocity2D is just a 2D Vector,
    // just like Position2D. But since components are identified
    // by their classes and an entity can only hold one component
    // instance per component class, we do not re-use classes at
    // this point.
    //
    // I even chose to give the properties of Velocity2D different
    // names from those of Position2D, because in my experience
    // this makes both components easier to use later on.
    vx: number = 0;
    vy: number = 0;
}

class DOMNodeReference {
    // We are going to need a reference to the dom node we set up
    // in our HTML file, in order to manipulate it later on.
    node: HTMLElement;
}

/* SYSTEMS */
class InputSystem extends System {
    // Every system can provide a static `queries` property that contains
    // a hashmap of filter arrays. The results of these queries will be
    // available under e.g. `this.queries.movables` in the execute method
    // of the system.
    static queries = {
        // We want every entity, that has a `Velocity2D` component.
        movables: [Velocity2D]
    };

    // Here we are going to store all key presses. Doing so is not
    // ECS-specific but specific to this example.
    private readonly keysPressed = new Set<string>();

    // Every system can provide an `initialize` method, which will be called
    // whenever a system is registered to a scene. We'll use this method
    // do register our DOM event handlers.
    initialize() {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            // Add the pressed key to our set
            this.keysPressed.add(event.key);
        });

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            // Remove the released key from our set
			this.keysPressed.delete(event.key);
        });
    }

    // Every system must provide an `execute` method. here's where we
    // implement our logic. `execute` is called on every frame in our
    // game, so at 60fps it is called 60 times per second.
    execute() {
        // We loop through the query results of the movables query we
        // defined above.
        for (const movable of this.queries.movables.all) {
            // This is how we can access the data stored in the
            // `Velocity2D` component of our movable entity.
            const velocity = movable.get(Velocity2D);

            if (this.keysPressed.has("ArrowUp")) {
                velocity.vy = -1;
            } else if (this.keysPressed.has("ArrowDown")) {
                velocity.vy = 1;
            } else {
                velocity.vy = 0;
            }

            if (this.keysPressed.has("ArrowLeft")) {
                velocity.vx = -1;
            } else if (this.keysPressed.has("ArrowRight")) {
                velocity.vx = 1;
            } else  {
                velocity.vx = 0;
            }
        }
    }
}

class MovementSystem extends System {
    static queries = {
        // Now we want every entity, that has a `Velocity2D` and a
        // `Position2D` component.
        movables: [Velocity2D, Position2D]
    };

    // The execute method always receives the current frame delta time,
    // which allows us to calculate stable movement regardless of the
    // underlying performance.
    //
    // For more on that see: https://medium.com/@dr3wc/understanding-delta-time-b53bf4781a03
    execute(dt: number) {
        for (const movable of this.queries.movables.all) {
            // We retrieve both velocity and position from our
            // entities
            const position = movable.get(Position2D);
            const velocity = movable.get(Velocity2D);

            // And then we update the position based on the
            // velocity
            position.x += dt * velocity.vx;
            position.y += dt * velocity.vy;
        }
    }
}

class ObjectsRenderer extends System {
    static queries = {
        // This system can render any entity that has a `Position2D`
        // and a `DOMNodeReference` component
        renderables: [Position2D, DOMNodeReference]
    };

    execute() {
        for (const renderable of this.queries.renderables.all) {
            const { x, y } = renderable.get(Position2D);
            const { node } = renderable.get(DOMNodeReference);

            // Sync position with our DOM node styles. We're using transforms
            // here, because it should be more performant - but we shouldn't
            // rely on DOM rendering in any performance-critical scenario
            // anyway. This is just for demo purposes!
            node.style.transform = `translateX(${x}px) translateY(${y}px)`;
        }
    }
}

const scene = new Scene();

// The order in which we register our systems matters. Systems are
// executed in the order they've been registered.
scene.systems.register(InputSystem);
scene.systems.register(MovementSystem);
scene.systems.register(ObjectsRenderer);

// Now we create our entity and apply our components to it.
scene.entities.create()
    .add(Position2D)
    .add(Velocity2D)
    .add(DOMNodeReference, {
        // We can initialize components upon adding them
        node: document.getElementById('object')!
	});

// We need to calculate the delta time on our own, so
// we capture the timestamp at the beginning
let start = Date.now();
function run() {
    const current = Date.now();
    const delta = current - start; // Manual calculation of delta
    start = current;

    // Execute the scene - this will call the execute method of
    // all systems in sequence.
    scene.execute(delta);

    // Continue the loop on the next animation frame
    requestAnimationFrame(run);
}

run();
