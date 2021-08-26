import { Body } from "detect-collisions";

//
// We're using detect-collisions for Collision Detection. `Body` is the
// base class for shapes like circles or polygons. Our component `CollisionShape`
// will be used to attach those shapes to an entity, so we can detect collisions
// between those shapes later on.
//
// see also: https://github.com/Prozi/detect-collisions#readme
//
export class CollisionShape {
    body: Body
}
