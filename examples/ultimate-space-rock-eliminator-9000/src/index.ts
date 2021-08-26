import "./settings"
import { Application } from "pixi.js";
import { Scene } from "../../../src"; // actually: nopun-ecs

import { Input, Score, StageRef } from "./resource";
import { DrawingSystem, InputSystem, TTLSystem, ControlSystem, MovementSystem, CollisionSystem, DebugSystem, TurnSystem, SoundSystem, OSDSystem } from "./system";
import { addMusicToScene, addTitleScreenToScene } from "./entity";

const application = new Application({
    resizeTo: window,
    backgroundAlpha: 0
});

const scene = new Scene();

scene.resources.add(Input);
scene.resources.add(StageRef, { current: application.stage });
scene.resources.add(Score);

scene.systems.register(InputSystem);
scene.systems.register(TTLSystem);
scene.systems.register(ControlSystem);
scene.systems.register(TurnSystem);
scene.systems.register(MovementSystem);
scene.systems.register(CollisionSystem);
scene.systems.register(SoundSystem);
scene.systems.register(DrawingSystem);
scene.systems.register(OSDSystem);
// scene.systems.register(DebugSystem);

addTitleScreenToScene(scene, 'Ultimate Space Rock Eliminator 9000', 'Press "Enter" to start a new game');
addMusicToScene(scene);

document.body.appendChild(application.view);

application.ticker.add(dt => {
    scene.execute(dt);
});
