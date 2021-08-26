//
// The `Input` resource contains a map of all the control command that are
// relevant for this game. A system will be responsible to translate keystrokes
// to this map.
//
export class Input {
    left: boolean
    accelerate: boolean
    right: boolean
    decelerate: boolean
    fire: boolean
    continue: boolean
}
