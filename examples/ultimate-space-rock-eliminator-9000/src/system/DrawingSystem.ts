import { System } from "../../../../src"; // actually: nopun-ecs
import { Rectangle } from "pixi.js";

import { StageRef } from "../resource";
import { PIXIContainerRef, PIXIFlipBookSprite, Position2D, Rotation, Velocity2D } from "../component";

//
// This system is responsible for translating component values into drawing
// instructions
//
export class DrawingSystem extends System {
    static queries = {
        drawables: [PIXIContainerRef],
        drawablesWithPosition: [PIXIContainerRef, Position2D],
        drawablesWithVelocity: [PIXIContainerRef, Velocity2D],
        drawablesWithRotation: [PIXIContainerRef, Rotation],
        drawablesWithFlipBookSprite: [PIXIContainerRef, PIXIFlipBookSprite]
    };

    execute(dt: number) {
        const {current: stage} = this.scene.resources.get(StageRef);

        for (const entity of this.queries.drawables.added) {
            const {current: container} = entity.get(PIXIContainerRef);
            stage.addChild(container);
        }

        for (const entity of this.queries.drawables.removed) {
            const {current: container} = entity.get(PIXIContainerRef);
            stage.removeChild(container);
        }

        for (const entity of this.queries.drawables.all) {
            const {current: container, centered} = entity.get(PIXIContainerRef);

            if (centered) {
                container.position.set(
                    window.innerWidth / 2,
                    window.innerHeight / 2
                );
            }
        }

        for (const entity of this.queries.drawablesWithPosition.all) {
            const {current: container} = entity.get(PIXIContainerRef);
            const position = entity.get(Position2D);

            container.position.set(position.x, position.y);
        }

        for (const entity of this.queries.drawablesWithVelocity.all) {
            const {current: container} = entity.get(PIXIContainerRef);
            const {angle} = entity.get(Velocity2D);

            container.angle = angle;
        }

        for (const entity of this.queries.drawablesWithRotation.all) {
            const {current: container} = entity.get(PIXIContainerRef);
            const {value: rotation} = entity.get(Rotation);

            container.angle = rotation;
        }

        for (const entity of this.queries.drawablesWithFlipBookSprite.all) {
            const flipBookSprite = entity.get(PIXIFlipBookSprite);
            if (!flipBookSprite.sprite.texture.baseTexture.width) {
                break;
            }

            flipBookSprite.progress = (flipBookSprite.progress + dt * flipBookSprite.speed) % (flipBookSprite.vtiles * flipBookSprite.htiles);

            const frame = Math.round(flipBookSprite.progress) - 1;
            const twidth = flipBookSprite.width / flipBookSprite.vtiles;
            const theight = flipBookSprite.height / flipBookSprite.htiles;

            flipBookSprite.sprite.texture.frame = new Rectangle(
                (frame % flipBookSprite.vtiles) * twidth,
                Math.floor(frame / flipBookSprite.htiles) * theight,
                twidth,
                theight
            );
        }
    }
}
