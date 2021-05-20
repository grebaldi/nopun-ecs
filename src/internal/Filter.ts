import { ComponentConstructor } from "./Component";
import { Entity } from "./Entity";

export type Node =
	| ComponentConstructor
	| Filter;

interface FilterFn {
	(entity: Entity): boolean
}

export class Filter {
	private constructor(
		public readonly filterFn: FilterFn
	) {}

	public static from(filterFn: FilterFn): Filter {
		return new Filter(filterFn);
	}
}

function applyFilter(entity: Entity, node: Node): boolean {
	return node instanceof Filter ? node.filterFn(entity) : entity.has(node);
}

export function Not(...nodes: Node[]) {
    return Filter.from(entity => {
		for (const node of nodes) {
			if (applyFilter(entity, node)) {
				return false;
			}
		}

		return true;
	});
}

export function And(...nodes: Node[]) {
	return Filter.from(entity => {
		for (const node of nodes) {
			if (!applyFilter(entity, node)) {
				return false;
			}
		}

		return true;
	});
}

export function Or(...nodes: Node[]) {
	return Filter.from(entity => {
		for (const node of nodes) {
			if (applyFilter(entity, node)) {
				return true;
			}
		}

		return false;
	});
}

export function Xor(...nodes: Node[]) {
	return Filter.from(entity => {
		let match = false;
		for (const node of nodes) {
			if (applyFilter(entity, node)) {
				if (match) {
					return false;
				} else {
					match = true;
				}
			}
		}

		return match;
	});
}
