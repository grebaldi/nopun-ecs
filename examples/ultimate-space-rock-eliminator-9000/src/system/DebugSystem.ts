import { System } from "../../../../src"; // actually: nopun-ecs

import { CollisionShape } from "../component";

//
// This is a system that visualizes all collision shapes for debugging purposes
//
export class DebugSystem extends System {
    static queries = {
        collisionShapes: [CollisionShape]
    };

    execute() {
        const context = (document.getElementById('debug') as HTMLCanvasElement).getContext('2d');

        if (context) {
            context.canvas.width  = window.innerWidth;
            context.canvas.height = window.innerHeight;

            context.clearRect(0, 0, window.innerWidth, window.innerHeight);

            context.strokeStyle = '#FFFFFF';
            context.beginPath();

            for (const entity of this.queries.collisionShapes.all) {
                entity.get(CollisionShape).body.draw(context);
            }

            context.stroke();
        }
    }
}
