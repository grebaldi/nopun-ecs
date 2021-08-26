import { Howl } from "howler";
import { Entity, Scene } from "../../../../../src"; // actually: nopun-ecs

import { Sound } from "../../component";

import Music from "./Music.mp3";

//
// This is a factory function that compoeses a new music entity for us
//
export function addMusicToScene(scene: Scene): Entity {
    return scene.entities.create()
        .add(Sound, {
            value: new Howl({
                src: [Music],
                volume: .1,
                loop: true
            })
        });
}
