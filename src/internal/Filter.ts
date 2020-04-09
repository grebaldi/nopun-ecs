import { ComponentConstructor } from "./Component";

export class Negation {
    constructor(public readonly subject: ComponentConstructor) {}
}

export type Filter = (ComponentConstructor | Negation)[];

export function Not(cc: ComponentConstructor) {
    return new Negation(cc);
}
