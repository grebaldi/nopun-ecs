import { System } from "../../../../src"; // actually: nopun-ecs

import { Input } from "../resource";

//
// This system is responsible for translating key strokes into
// control commands
//
export class InputSystem extends System {
    private readonly keysPressed = new Set<string>();

    initialize() {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            this.keysPressed.add(event.key);
        });

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            this.keysPressed.delete(event.key);
        });
    }

    execute() {
        const input = this.scene.resources.get(Input);

        input.left = this.keysPressed.has('ArrowLeft');
        input.accelerate = this.keysPressed.has('ArrowUp');
        input.right = this.keysPressed.has('ArrowRight');
        input.decelerate = this.keysPressed.has('ArrowDown');
        input.fire = this.keysPressed.has(' ');
        input.continue = this.keysPressed.has('Enter');
    }
}
