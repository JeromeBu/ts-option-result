import { curry } from "./utils";

export interface ResultCases<A, E, B> {
    ok: (a: A) => B;
    err: (e: E) => B;
}

export interface IResult<A, E> {
    isOk: () => boolean;
    isErr: () => boolean;
    map: <B>(f: (a: A) => B) => Result<B, E>;
    flatMap: <B, F>(f: (a: A) => Result<B, F>) => Result<B, E | F>;
    caseOf: <B>(cases: ResultCases<A, E, B>) => B;

    /**
     * Careful, this will throw if Result is Err
     */
    getOrThrow: () => A;

    /**
     * Careful, this will throw if Result is Ok
     */
    _getErrorOrThrow: () => E;
}

export const ok = <A, E>(value?: A): Ok<A, E> => new Ok(value as A);
export const err = <A, E>(error: E): Err<A, E> => new Err(error);

export type Result<T, E> = Ok<T, E> | Err<T, E>;

export class Ok<A, E> implements IResult<A, E> {
    constructor(private value: A) {}

    public isOk() {
        return true;
    }

    public isErr() {
        return !this.isOk();
    }

    public map<B>(f: (a: A) => B): Result<B, E> {
        return ok(f(this.value));
    }

    public flatMap<B, F>(f: (a: A) => Result<B, F>): Result<B, E | F> {
        return f(this.value);
    }

    public caseOf<B>(cases: ResultCases<A, E, B>): B {
        return cases.ok(this.value);
    }

    public getOrThrow(): A {
        return this.value;
    }

    /**
     * Careful, this will throw if Result is Ok
     */
    public _getErrorOrThrow(): E {
        throw new Error("Cannot get error on Ok value");
    }
}

export class Err<A, E> implements IResult<A, E> {
    constructor(private error: E) {}

    public isOk() {
        return false;
    }

    public isErr() {
        return !this.isOk();
    }

    public map<B>(_: (a: A) => B): Result<B, E> {
        return err(this.error);
    }

    public flatMap<B, F>(_: (a: A) => Result<B, F>): Result<B, E | F> {
        return err<B, E | F>(this.error);
    }

    public caseOf<B>(cases: ResultCases<A, E, B>): B {
        return cases.err(this.error);
    }

    public getOrThrow(): A {
        throw this.error;
    }

    /**
     * Careful, this will throw if Result is Ok
     */
    public _getErrorOrThrow(): E {
        return this.error;
    }
}

export namespace Result {
    export const fromNullable =
        <A, E>(error: E) =>
        (value: A | undefined | null): Result<A, E> => {
            if (value === null || value === undefined) return err(error);
            return ok(value);
        };

    export function map<A, E, B>(f: (a: A) => B, a: Result<A, E>): Result<B, E>;
    // prettier-ignore
    export function map<A, E, B>(f: (a: A) => B): (a: Result<A, E>) => Result<B, E>;
    export function map<A, E, B>(f: (a: A) => B, resA?: Result<A, E>): any {
        return curry((result: Result<A, E>) => result.map(f), resA);
    }

    // prettier-ignore
    export function flatMap<A, E, B, F>(f: (a: A) => Result<B, F>, a: Result<A, E>): Result<B, E | F>;
    // prettier-ignore
    export function flatMap<A, E, B, F>(f: (a: A) => Result<B, F>): (a: Result<A, E>) => Result<B, E | F>;
    // prettier-ignore
    export function flatMap<A, E, B, F>(f: (a: A) => Result<B, F>, optA?: Result<A, E>): any {
    return curry((result: Result<A, E>) => result.flatMap(f), optA);
  }

    // prettier-ignore
    export function caseOf<A, E, B>(cases: ResultCases<A, E, B>, resA: Result<A, E>): B
    // prettier-ignore
    export function caseOf<A, E, B>(cases: ResultCases<A, E, B>): (resA: Result<A, E>) => B
    // prettier-ignore
    export function caseOf<A, E, B>(cases: ResultCases<A, E, B>, resA?: Result<A, E>): any {
    return curry(result => result.caseOf(cases), resA);
  }
}

type DictionaryOfResults = { [key in string]: Result<unknown, unknown> };
type DictionaryOfOkValues<T extends DictionaryOfResults> = {
    [K in keyof T]: T[K] extends Result<infer A, unknown> ? A : never;
};
type InferErrors<T extends DictionaryOfResults> = T[keyof T] extends Result<unknown, infer E>
    ? E
    : never;

export const combine = <T extends { [key in string]: Result<unknown, unknown> }>(
    resultsObject: T,
): Result<DictionaryOfOkValues<T>, InferErrors<T>> => {
    for (const result of Object.values(resultsObject)) {
        if (result.isErr()) return err(result._getErrorOrThrow()) as any;
    }

    return ok(
        Object.keys(resultsObject).reduce(
            (acc, key) => ({
                ...acc,
                [key]: resultsObject[key].getOrThrow(),
            }),
            {} as DictionaryOfOkValues<T>,
        ),
    );
};
