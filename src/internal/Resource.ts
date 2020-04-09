export type Resource = object;
export type ResourceConstructor<R extends Resource = any> = { new(): R }
