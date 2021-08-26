//
// This component defines a vector in 2D space that represents an
// entity's velocity.
//
// It is defined by an `angle` and a `speed` value, because these
// are most relevant for our input.
//
// The component also provides two computed properties `vx` and `vy`
// that will be used by a system to mutate the entity's position.
//
export class Velocity2D {
    angle: number = 0
    speed: number = 0

    get vx(): number {
        return Math.cos(this.angle * Math.PI / 180) * this.speed;
    }

    get vy(): number {
        return Math.sin(this.angle * Math.PI / 180) * this.speed;
    }
}
