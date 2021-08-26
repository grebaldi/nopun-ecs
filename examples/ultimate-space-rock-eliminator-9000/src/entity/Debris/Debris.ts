import { Howl } from "howler";
import { Entity, Scene } from "../../../../../src"; // actually: nopun-ecs

import { Sound } from "../../component";

import DebrisSound from "./Debris.wav";

//
// This is a factory function that compoeses a new debris sound for us
//
export function addDebrisToScene(scene: Scene): Entity {
    return scene.entities.create()
        .add(Sound, {
            value: new Howl({
                src: [DebrisSound],
                volume: .1
            })
        });
}
