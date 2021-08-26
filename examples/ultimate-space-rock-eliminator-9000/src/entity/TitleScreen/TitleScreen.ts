import { Entity, Scene } from "../../../../../src"; // actually: nopun-ecs
import { Text, Container } from "pixi.js";

import { PIXIContainerRef } from "../../component";

//
// This is a tag component. It is used to identify an entity as the title screen
//
export class TitleScreen {
}

//
// This is a factory function that compoeses a new title screen entity for us
//
export function addTitleScreenToScene(scene: Scene, title: string, text: string): Entity {
    const container = new Container();
    const titleText = new Text(title, {
        fontFamily : 'Arial',
        fontSize: 80,
        fill : 0xffffff,
        align : 'center'
    });
    const subtitleText = new Text(text, {
        fontFamily : 'Arial',
        fontSize: 32,
        fill : 0xffffff,
        align : 'center'
    })

    titleText.position.set(0, -80);
    titleText.anchor.set(.5, .5);
    titleText.zIndex = 1000;

    subtitleText.position.set(0, 16);
    subtitleText.anchor.set(.5, .5);
    subtitleText.zIndex = 1000;

    container.addChild(titleText);
    container.addChild(subtitleText);

    return scene.entities.create()
        .add(TitleScreen)
        .add(PIXIContainerRef, { current: container, centered: true });
}
