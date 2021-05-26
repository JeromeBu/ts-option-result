export function curry<A, T>(callback: (a: A) => T, a?: A): T;
export function curry<A, T>(callback: (a: A) => T): (a: A) => T;
export function curry<A, T>(callback: (a: A) => T, a?: A): any {
    if (typeof a === "undefined") return callback;
    return callback(a);
}
