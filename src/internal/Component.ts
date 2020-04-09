export type Component = object;
export type ComponentConstructor<C extends Component = any> = { new(): C }
