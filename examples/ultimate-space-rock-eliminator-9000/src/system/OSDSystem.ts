import { System } from "../../../../src"; // actually: nopun-ecs
import { Text } from "pixi.js";

import { Score, StageRef } from "../resource";
import { Asteroid } from "../entity";

//
// This system manages all on-screen text (which boils down to the score atm.)
//
export class OSDSystem extends System {
    static queries = {
        asteroids: [Asteroid]
    };

    private osd: Text = new Text('', {
        fontFamily : 'Arial',
        fontSize: 24,
        fill : 0xff1010,
        align : 'right'
    });

    initialize() {
        const {current: stage} = this.scene.resources.get(StageRef);

        this.osd.anchor.set(1, 0);
        this.osd.zIndex = 1000;
        this.osd.visible = false;

        stage.addChild(this.osd);
    }

    execute(dt: number) {
        for (const asteroid of this.queries.asteroids.added) {
            this.osd.visible = true;
            break;
        }

        const score = this.scene.resources.get(Score);

        this.osd.text = `Level: ${score.level}, Asteroids left: ${this.queries.asteroids.count}, Score: ${score.value}`;
        this.osd.position.set(window.innerWidth - 10, 10)
    }
}
