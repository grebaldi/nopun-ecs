import { System, Or } from "../../../../src"; // actually: nopun-ecs

import { Score } from "../resource";
import { Position2D } from "../component";
import { Asteroid, addAsteroidToScene, addPlayerToScene, addTitleScreenToScene, Player, TitleScreen, Bullet } from "../entity";

//
// This system tracks winning an losing conditions and also takes care of
// displaying the respective splash screens at the end of each turn.
//
export class TurnSystem extends System {
    static queries = {
        titleScreen: [TitleScreen],
        player: [Player],
        asteroids: [Asteroid],
        objects: [Or(Asteroid, Player, Bullet)]
    }

    execute() {
        const score = this.scene.resources.get(Score);

        for (const titleScreen of this.queries.titleScreen.removed) {
            score.level = this.queries.player.count > 0 ? score.level + 1 : 1;

            for (const object of this.queries.objects.all) {
                this.scene.entities.destroy(object);
            }

            if (score.level === 1) {
                score.value = 0;
            }

            addPlayerToScene(this.scene);
            for (let i = 0; i < score.level; i++) {
                let x = window.innerWidth/4 * Math.random();
                if (Math.random() > .5) {
                    x = window.innerWidth - x;
                }
                let y = window.innerHeight/4 * Math.random();
                if (Math.random() > .5) {
                    y = window.innerHeight - y;
                }

                addAsteroidToScene(this.scene)
                    .add(Position2D, { x, y })
            }

            return;
        }

        if (this.queries.titleScreen.count < 1) {
            if (this.queries.player.count < 1) {
                addTitleScreenToScene(
                    this.scene,
                    'Game Over',
                    `Your score: ${score.value}\nPress "Enter" to start a new game`
                );
            } else if (this.queries.asteroids.count < 1) {
                addTitleScreenToScene(
                    this.scene,
                    `You finished level ${score.level}!`,
                    `Press "Enter" to play level ${score.level + 1}`
                );
            }
        }
    }
}
