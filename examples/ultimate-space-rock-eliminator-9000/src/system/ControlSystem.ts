import { System } from "../../../../src"; // actually: nopun-ecs

import { Input } from "../resource";
import { Velocity2D } from "../component";
import { Player, shootBullet, TitleScreen } from "../entity";

//
// This system is responsible for translating player commands into
// mutations of the affected entities
//
export class ControlSystem extends System {
    static queries = {
        titleScreen: [TitleScreen],
        player: [Player]
    };

    private bulletSpawningIsLocked: boolean = false;

    execute(dt: number) {
        const input = this.scene.resources.get(Input);

        for (const titleScreen of this.queries.titleScreen.all) {
			// If the title screen is visible and the player hits "Enter", the game starts
            if (input.continue) {
                this.scene.entities.destroy(titleScreen);
            }
        }

        for (const player of this.queries.player.all) {
            const velocity = player.get(Velocity2D);

			// By pressing "Up" or "Down", the player can accelerate or decelerate their ship
            if (input.accelerate && velocity.speed < 15) {
                velocity.speed += dt;
            } else if (input.decelerate && velocity.speed > -15) {
                velocity.speed -= dt;
            } else if (velocity.speed < 0) {
                velocity.speed = Math.min(velocity.speed + .1 * dt, 0);
            } else if (velocity.speed > 0) {
                velocity.speed = Math.max(velocity.speed - .1 * dt, 0);
            } else {
                velocity.speed = 0;
            }

			// By pressing "Left" or "Right" the player can tilt the angle of the ship
            if (input.left) {
                velocity.angle -= 6 * dt;
            } else if (input.right) {
                velocity.angle += 6 * dt;
            }

			// By pressing "Space", the player fires a bullet
            if (input.fire) {
                if (!this.bulletSpawningIsLocked) {
                    shootBullet(player);
                    this.bulletSpawningIsLocked = true;
                }
            } else {
                this.bulletSpawningIsLocked = false;
            }
        }
    }
}
