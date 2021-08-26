import { Entity, Scene } from "../../../../../src"; // actually: nopun-ecs
import { Sprite } from "pixi.js";
import { Howl } from "howler";

import { PIXIContainerRef, PIXIFlipBookSprite, Sound, TTL } from "../../component";

import ExplosionImage from "./Explosion.png";
import ExplosionSound from "./Explosion.wav";

//
// This is a factory function that compoeses a new explosion for us
//
export function addExplosionToScene(scene: Scene): Entity {
    const sprite = Sprite.from(ExplosionImage);

    sprite.anchor.set(.5, .5);
    sprite.scale.set(3);
    sprite.zIndex = 500;

    return scene.entities.create()
        .add(PIXIContainerRef, { current: sprite })
        .add(PIXIFlipBookSprite, {
            sprite,
            width: 256,
            height: 256,
            vtiles: 4,
            htiles: 4,
            speed: .25
        })
        .add(Sound, {
            value: new Howl({
                src: [ExplosionSound],
                volume: .25
            })
        })
        .add(TTL, { value: 64 });
}
