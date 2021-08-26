import { Entity, Scene } from "../../../../../src"; // actually: nopun-ecs
import { Sprite } from "pixi.js";
import { Polygon } from "detect-collisions";

import { CollisionShape, PIXIContainerRef, Position2D, Velocity2D } from "../../component";
import { addBulletToScene } from "../Bullet";

import image from "./Player.png";

//
// This is a tag component. It is used to identify an entity as the player
//
export class Player {
}

//
// This is a factory function that compoeses a new player entity for us
//
export function addPlayerToScene(scene: Scene): Entity {
    const sprite = Sprite.from(image);
    const width = 84;
    const height = 72;

    sprite.pivot.set(width/2, height/2);

    return scene.entities.create()
        .add(Player)
        .add(CollisionShape, { body: new Polygon(0, 0, [
            [-width/2, -height/2],
            [width/2, 0],
            [-width/2, height/2]]
        )})
        .add(PIXIContainerRef, { current: sprite })
        .add(Position2D, { x: window.innerWidth/2, y: window.innerHeight/2 })
        .add(Velocity2D, { angle: 0, speed: 0 });
}

//
// This helper function create a new bullet from the player's position
//
export function shootBullet(player: Entity): void {
    const position = player.get(Position2D);
    const velocity = player.get(Velocity2D);

    addBulletToScene(player.scene)
		// Important!: components are mutable, so we need to deep-copy them
		// when we try to apply the same value to a different entity. Otherwise,
		// mutations to the component of one entity would be replicated on the
		// other, because they're referencing the same value in memory.
		//
		// In this instance, a simple spread is enough, because `Position2D` is
		// a completely flat structure.
		//
		// If the structure were any deeper, this statement would become more
		// complicated. It is therefore recommended to keep components as flat
		// as possible.
        .add(Position2D, { ...position })
        .update(Velocity2D, { angle: velocity.angle });
}
