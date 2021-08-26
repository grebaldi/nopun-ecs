import { System } from "../../../../src"; // actually: nopun-ecs

import { Position2D, Rotation, Spin, Velocity2D } from "../component";
import { Bullet } from "../entity";

//
// This system takes care that all entities with a position and a velocity
// as well as all entities with a spin and a rotation move across the
// screen accordingly.
//
export class MovementSystem extends System {
    static queries = {
        movables: [Position2D, Velocity2D],
        spinning: [Spin, Rotation]
    };

    execute(dt: number) {
        for (const entity of this.queries.movables.all) {
            const position = entity.get(Position2D);
            const velocity = entity.get(Velocity2D);
            const padding = 115;
            const screenWidth = window.innerWidth + padding * 2;
            const screenHeight = window.innerHeight + padding * 2;

            position.x = -padding + (((position.x + padding + velocity.vx * dt) % screenWidth + screenWidth) % screenWidth);
            position.y = -padding + (((position.y + padding + velocity.vy * dt) % screenHeight + screenHeight) % screenHeight);

            if (entity.has(Bullet)) {
                if (position.x < 0 || position.x > window.innerWidth || position.y < 0 || position.y > window.innerHeight) {
                    this.scene.entities.destroy(entity);
                }
            }
        }

        for (const entity of this.queries.spinning.all) {
            const {value: spin} = entity.get(Spin);
            const rotation = entity.get(Rotation);

            rotation.value += spin * dt;
        }
    }
}
