import { err, ok, Result, ResultCases } from "./result";
import { curry } from "./utils";

export const fromResult = <A, E>(result: Result<A, E>): ResultAsync<A, E> =>
    new ResultAsync(Promise.resolve(result));
export const okAsync = <A, E>(value: A): ResultAsync<A, E> => fromResult(ok<A, E>(value));
export const errAsync = <A, E>(error: E): ResultAsync<A, E> => fromResult(err<A, E>(error));

export const fromPromise = <T, F>(somePromise: Promise<T>, onError?: (e: unknown) => F) => {
    const promiseResult: Promise<Result<T, F>> = somePromise
        .then(t => ok<T, F>(t))
        .catch(e => {
            if (onError) return err(onError(e));
            return err(e);
        });

    return new ResultAsync(promiseResult);
};

export class ResultAsync<A, E> implements PromiseLike<Result<A, E>> {
    constructor(private promise: Promise<Result<A, E>>) {}

    public map<B>(f: (a: A) => B): ResultAsync<B, E> {
        return new ResultAsync(this.promise.then(Result.map(f)));
    }

    public flatMap<B, F>(f: (a: A) => Result<B, F> | ResultAsync<B, F>): ResultAsync<B, E | F> {
        return new ResultAsync(
            this.promise.then(resA => {
                return resA.caseOf({
                    ok: a => {
                        const resB: Result<B, E | F> | ResultAsync<B, E | F> = f(a);
                        return resB instanceof ResultAsync ? resB.promise : resB;
                    },
                    err,
                });
            }),
        );
    }

    public caseOf<B>(cases: ResultCases<A, E, B>) {
        return this.promise.then(a => a.caseOf(cases)).catch(cases.err);
    }

    public then<B, F>(
        onFulfilled?: (result: Result<A, E>) => B | PromiseLike<B>,
        onRejected?: (reason: unknown) => F | PromiseLike<F>,
    ): PromiseLike<B | F> {
        return this.promise.then(onFulfilled, onRejected);
    }
}

export namespace ResultAsync {
    export function map<A, E, B>(f: (a: A) => B, a: ResultAsync<A, E>): ResultAsync<B, E>;
    // prettier-ignore
    export function map<A, E, B>(f: (a: A) => B): (a: ResultAsync<A, E>) => ResultAsync<B, E>;
    export function map<A, E, B>(f: (a: A) => B, resA?: ResultAsync<A, E>): any {
        return curry((result: ResultAsync<A, E>) => result.map(f), resA);
    }

    // prettier-ignore
    export function flatMap<A, E, B, F>(f: (a: A) => Result<B, F> | ResultAsync<B, F>, a: ResultAsync<A, E>): ResultAsync<B, E | F>;
    // prettier-ignore
    export function flatMap<A, E, B, F>(f: (a: A) => Result<B, F> | ResultAsync<B, F>): (a: ResultAsync<A, E>) => ResultAsync<B, E | F>;
    // prettier-ignore
    export function flatMap<A, E, B, F>(f: (a: A) => Result<B, F> | ResultAsync<B, F>, optA?: ResultAsync<A, E>): any {
        return curry((resultAsync: ResultAsync<A, E>) => resultAsync.flatMap(f), optA);
    }

    // prettier-ignore
    export function caseOf<A, E, B>(cases: ResultCases<A, E, B>, resA: ResultAsync<A, E>): Promise<B>
    // prettier-ignore
    export function caseOf<A, E, B>(cases: ResultCases<A, E, B>): (resA: ResultAsync<A, E>) => Promise<B>
    // prettier-ignore
    export function caseOf<A, E, B>(cases: ResultCases<A, E, B>, resA?: ResultAsync<A, E>): any {
        return curry(resultAsync => resultAsync.caseOf(cases), resA);
    }
}
