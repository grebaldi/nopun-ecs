import { Entity, Scene } from "../../../../../src"; // actually: nopun-ecs
import { Sprite } from "pixi.js";
import { Circle } from "detect-collisions";

import { CollisionShape, PIXIContainerRef, Position2D, Rotation, Spin, Velocity2D } from "../../component";
import { addDebrisToScene } from "../Debris";

import AsteroidImage1 from "./Asteroid.1.png";
import AsteroidImage2 from "./Asteroid.2.png";
import AsteroidImage3 from "./Asteroid.3.png";

//
// The idea is, that asteroids can have 3 sizes. A large asteroid breaks up into
// 3 medium asteroids. A medium asteroid breaks up into 3 small asteroids. if a small
// asteroid gets hit, it just vanishes.
//
// The class `AsteroidSize` is a value object that encapsulates these 2 distinct values.
//
class AsteroidSize {
    private constructor(
        public readonly radius: number,
        public readonly baseSpeed: number,
        public readonly minSpeed: number,
        public readonly points: number,
        public readonly next: () => AsteroidSize[]
    ) {}

    public static LARGE = new AsteroidSize(120, 2, 1, 10, () => [AsteroidSize.MEDIUM]);
    public static MEDIUM = new AsteroidSize(60, 4, 2, 20, () => [AsteroidSize.SMALL]);
    public static SMALL = new AsteroidSize(30, 8, 4, 40, () => []);
}

//
// This is a tag component. It is used to identify entities as asteroids
// and also carries the asteroid's size.
//
export class Asteroid {
    size: AsteroidSize
}

//
// This is a factory function that compoeses a new asteroid for us
//
export function addAsteroidToScene(scene: Scene, size: AsteroidSize = AsteroidSize.LARGE): Entity {
    const sprite = Sprite.from([AsteroidImage1, AsteroidImage2, AsteroidImage3][Math.round(Math.random() * 2)]);
    const width = 254;
    const height = 254;

    sprite.pivot.set(width/2, height/2);
    sprite.scale.set(size.radius*2/width, size.radius*2/height);

    const angle = 15 + Math.random() * 60 + [0, 90, 180, 270][Math.round(Math.random() * 3)];

    return scene.entities.create()
        .add(Asteroid, { size })
        .add(CollisionShape, { body: new Circle(0, 0, size.radius) })
        .add(PIXIContainerRef, { current: sprite })
        .add(Velocity2D, { angle, speed: size.minSpeed + Math.random() * size.baseSpeed })
        .add(Rotation, { value: Math.random() * 360 })
        .add(Spin, { value: Math.random() * size.baseSpeed });
}

//
// This helper function breaks up asteroids according to their size
//
export function breakAsteroid(asteroid: Entity): void {
    const position = asteroid.get(Position2D);
    const {size} = asteroid.get(Asteroid);

    asteroid.scene.entities.destroy(asteroid);

    for (const nextSize of size.next()) {
        for (let i = 0; i < 3; i++) {
            addAsteroidToScene(asteroid.scene, nextSize)
                .add(Position2D, { ...position });
        }
    }

	// We want the debris sound to play every time an asteroid breaks up
	// or gets destroyed
    addDebrisToScene(asteroid.scene);
}
