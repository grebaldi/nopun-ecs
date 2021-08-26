import { Entity, Scene } from "../../../../../src"; // actually: nopun-ecs
import { Graphics } from "pixi.js";
import { Polygon } from "detect-collisions";
import { Howl } from "howler";

import { CollisionShape, PIXIContainerRef, Sound, TTL, Velocity2D } from "../../component";

import BulletSound from "./Bullet.wav";

//
// This is a tag component. It is used to identify entities as bullets.
//
export class Bullet {
}

//
// This is a factory function that compoeses a new bullet for us
//
export function addBulletToScene(scene: Scene): Entity {
    const graphics = new Graphics();
    graphics.beginFill(0x00FF00);
    graphics.drawRect(0, 0, 40, 4);
    graphics.pivot.set(20, 2);

    return scene.entities.create()
        .add(Bullet)
        .add(PIXIContainerRef, { current: graphics })
        .add(CollisionShape, {
            body: new Polygon(0, 0, [
                [-20, -2],
                [20, -2],
                [20, 2],
                [-20, 2]
            ])
        })
        .add(Velocity2D, { angle: 0, speed: 20 })
        .add(TTL, { value: 60 })
        .add(Sound, {
            value: new Howl({
                src: [BulletSound],
                volume: .1
            })
        });
}
