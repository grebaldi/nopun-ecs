import { System } from "../../../../src"; // actually: nopun-ecs

import { TTL } from "../component";

//
// This system is the grim reaper. Any entity with a `TTL` component will have
// its time-to-live counted down progressively. Once that number reaches 0,
// this system removes the entity.
//
export class TTLSystem extends System {
    static queries = {
        withTTl: [TTL]
    }

    execute(dt: number) {
        for (const entity of this.queries.withTTl.all) {
            const ttl = entity.get(TTL);
            ttl.value -= dt;

            if (ttl.value <= 0) {
                this.scene.entities.destroy(entity);
            }
        }
    }
}
