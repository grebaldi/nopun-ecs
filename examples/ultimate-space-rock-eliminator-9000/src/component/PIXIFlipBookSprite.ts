import { Sprite } from "pixi.js";

//
// We're using pixi.js for graphics. Our component `PIXIFlipBookSprite`
// represents a special stateful sprite that changes its own framing on
// every update. The actual image is a spritesheet containing multiple
// frames. A system will be responsiple to "flip" through those frames
// so that the image appears to be animated.
//
// pixi.js actually has Primitives for that, but they require a lot of
// configuration if you are not using a tool like TexturePacker to
// generate the spritesheet. That's why I chose to implement this
// functionality myself.
//
// see also: https://pixijs.download/dev/docs/PIXI.Sprite.html
//
export class PIXIFlipBookSprite {
	// The Sprite containing our sprite sheet
    sprite: Sprite

	// The width of the entire spritesheet
    width: number

	// The height of the entire spritesheet
    height:number

	// How many frames does one column of our sprite sheet contain?
    vtiles: number

	// How many frames does one row of our sprite sheet contain?
    htiles: number

	// This tracks the progress of our animation
    progress: number = 0

	// How fast should our animation progress?
    speed: number = 1
}
