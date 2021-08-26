import { System } from "../../../../src"; // actually: nopun-ecs

import { Sound } from "../component";

//
// Immediately after an entity with a `Sound` component is added, this system
// takes care of playing the sound.
//
export class SoundSystem extends System {
    static queries = {
        withSound: [Sound]
    };

    execute() {
        for (const entity of this.queries.withSound.added) {
            const {value: sound} = entity.get(Sound);
            sound.play();
        }
    }
}
