import { fromNullable, Option } from "./option";
import { curry } from "./utils";

export namespace List {
    export function find<T>(f: (item: T) => boolean): (array: T[]) => Option<T>;
    export function find<T>(f: (item: T) => boolean, array: T[]): Option<T>;
    export function find<T>(f: (item: T) => boolean, array?: T[]): any {
        return curry(array => fromNullable(array.find(f)), array);
    }

    export const first = <T>(array: T[]) => fromNullable(array[0]);

    export const last = <T>(array: T[]) => fromNullable(array[array.length - 1]);
}
