import { err, ok } from "./result";
import type { Result } from "./result";
import { curry } from "./utils";

export interface OptionCases<A, B> {
    some: (a: A) => B;
    none: () => B;
}

export interface Option<A> {
    isNone: () => this is None;
    map: <B>(f: (a: A) => B) => Option<B>;
    flatMap: <B>(f: (a: A) => Option<B>) => Option<B>;
    caseOf: <B>(cases: OptionCases<A, B>) => B;
    getOrElse: (f: () => A) => A;
    getOrNull: () => A | null;
    toResult: <E>(error: E) => Result<A, E>;
}

export const some = <A>(a: A) => new Some(a);
export const none = () => new None();
export const fromNullable = <T>(value: T | undefined | null): Option<T> => {
    if (value === null || value === undefined) return none();
    return some(value);
};

export class Some<A> implements Option<A> {
    constructor(private value: A) {}

    public map<B>(f: (a: A) => B): Option<B> {
        return this.flatMap(a => some(f(a)));
    }

    public flatMap<B>(f: (a: A) => Option<B>): Option<B> {
        return f(this.value);
    }

    public getOrElse(_: () => A) {
        return this.value;
    }

    public getOrNull() {
        return this.value;
    }

    public caseOf<B>(cases: OptionCases<A, B>) {
        return cases.some(this.value);
    }

    public isNone() {
        return false;
    }

    public toResult<E>(_: E): Result<A, E> {
        return ok(this.value);
    }
}

export class None implements Option<never> {
    public map<B>(_: (a: never) => B) {
        return none();
    }

    public flatMap<B>(_: (a: never) => Option<B>) {
        return none();
    }

    public getOrElse<A>(f: () => A) {
        return f();
    }

    public getOrNull() {
        return null;
    }

    public caseOf<B>(cases: OptionCases<never, B>) {
        return cases.none();
    }

    public isNone() {
        return true;
    }

    public toResult<E>(error: E): Result<never, E> {
        return err(error);
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Option {
    export function map<A, B>(f: (a: A) => B, a: Option<A>): Option<B>;
    export function map<A, B>(f: (a: A) => B): (a: Option<A>) => Option<B>;
    export function map<A, B>(f: (a: A) => B, optA?: Option<A>): any {
        return curry((option: Option<A>) => option.map(f), optA);
    }

    // prettier-ignore
    export function flatMap<A, B>(f: (a: A) => Option<B>, a: Option<A>): Option<B>;
    // prettier-ignore
    export function flatMap<A, B>(f: (a: A) => Option<B>): (a: Option<A>) => Option<B>;
    export function flatMap<A, B>(f: (a: A) => Option<B>, optA?: Option<A>): any {
        return curry((option: Option<A>) => option.flatMap(f), optA);
    }

    export function getOrNull<A>(optA: Option<A>): A | null {
        return optA.getOrNull();
    }

    export function getOrElse<A>(f: () => A, optA: Option<A>): A;
    export function getOrElse<A>(f: () => A): (optA: Option<A>) => A;
    export function getOrElse<A>(f: () => A, optA?: Option<A>): any {
        return curry((option: Option<A>) => option.getOrElse(f), optA);
    }

    // prettier-ignore
    export function caseOf<A, B>(cases: OptionCases<A, B>, optA: Option<A>): B
    // prettier-ignore
    export function caseOf<A, B>(cases: OptionCases<A, B>): (optA: Option<A>) => B
    // prettier-ignore
    export function caseOf<A, B>(cases: OptionCases<A, B>, optA?: Option<A>): any {
        return curry(option => option.caseOf(cases), optA);
    }

    export function toResult<A, E>(error: E, optA: Option<A>): Result<A, E>;
    export function toResult<A, E>(error: E): (optA: Option<A>) => Result<A, E>;
    export function toResult<A, E>(error: E, optA?: Option<A>): any {
        return curry((option: Option<A>) => option.toResult(error), optA);
    }
}
