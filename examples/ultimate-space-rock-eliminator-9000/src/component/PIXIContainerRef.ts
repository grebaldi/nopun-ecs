import { Container } from "pixi.js";

//
// We're using pixi.js for graphics. Our component `PiXIContainerRef` can
// be used to attach any PIXI container to an entity.
//
// A system will be responsible to pick up those containers and "render"
// them (so: attach or detach them from our PIXI stage and update some properties).
//
// see also: https://pixijs.download/dev/docs/PIXI.Container.html
//
export class PIXIContainerRef {
    current: Container

	//
	// This property indicates to the Drawing system, that the attached container
	// is supposed to be centered within its parent.
	//
	// We need this for the title screen :)
	//
    centered: boolean = false
}
