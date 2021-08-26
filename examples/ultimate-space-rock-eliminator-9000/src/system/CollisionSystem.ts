import { System } from "../../../../src"; // actually: nopun-ecs
import { Polygon } from "detect-collisions";

import { CollisionShape, Position2D, Velocity2D } from "../component";
import { Asteroid, Bullet, addExplosionToScene, Player, breakAsteroid } from "../entity";
import { Score } from "../resource";

//
// This system is responsible for collision detection and
// executing logic for certain collisions
//
export class CollisionSystem extends System {
    static queries = {
        withPosition: [CollisionShape, Position2D],
        withVelocity: [CollisionShape, Velocity2D],
        player: [CollisionShape, Player],
        bullets: [CollisionShape, Bullet],
        asteroids: [CollisionShape, Asteroid]
    };

    execute() {
		// We use detect-collisions for collision detection and all shape
		// primitives of that library have their own position in 2D space.
		//
		// We need to sync the position and collision shape components
		// for all matching entities.
        for (const entity of this.queries.withPosition.all) {
            const position = entity.get(Position2D);
            const collisionShape = entity.get(CollisionShape);

            collisionShape.body.x = position.x;
            collisionShape.body.y = position.y;
        }

		// We also need to sync the angle of all collision shapes with
		// the angle of their respectove velocity
        for (const entity of this.queries.withVelocity.all) {
            const collisionShape = entity.get(CollisionShape);

            if (collisionShape.body instanceof Polygon) {
                const {angle} = entity.get(Velocity2D);

                collisionShape.body.angle = (angle / 180) * Math.PI;
            }
        }

		// What follows is the collision detection part

		// We grab the score resource, so we can update it, when an asteroid gets hit
        const score = this.scene.resources.get(Score);
        asteroidCollisions: for (const asteroid of this.queries.asteroids.all) {
            for (const player of this.queries.player.all) {
				// We check if the player crashed into an asteroid
                if (asteroid.get(CollisionShape).body.collides(player.get(CollisionShape).body)) {
                    const position = player.get(Position2D);
                    const { angle, speed } = player.get(Velocity2D);

					// This is a losing condition. The player explodes.
                    this.scene.entities.destroy(player);

                    addExplosionToScene(this.scene)
                        .add(Position2D, { ...position })
                        .add(Velocity2D, { angle, speed });

					// The asteroid was hit though. It still breaks up.
                    breakAsteroid(asteroid);

                    continue asteroidCollisions;
                }
            }

            for (const bullet of this.queries.bullets.all) {
				// Now we check, if an asteroid was hit by a bullet
                if (asteroid.get(CollisionShape).body.collides(bullet.get(CollisionShape).body)) {
                    const {speed} = asteroid.get(Velocity2D);
                    const {size} = asteroid.get(Asteroid);

                    this.scene.entities.destroy(bullet);

                    score.value += Math.round(size.points * speed);

                    breakAsteroid(asteroid);

                    continue asteroidCollisions;
                }
            }
        }
    }
}
