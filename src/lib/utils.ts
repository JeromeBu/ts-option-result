export function curry<A, T>(callback: (a: A) => T, a?: A): T;
export function curry<A, T>(callback: (a: A) => T): (a: A) => T;
export function curry<A, T>(callback: (a: A) => T, a?: A): any {
    if (!a) return callback;
    return callback(a);
}
