import { err, ok, Result } from "./result";

export const okAsync = <A, E>(value: A): ResultAsync<A, E> =>
    new ResultAsync(Promise.resolve(ok<A, E>(value)));

export const errAsync = <A, E>(error: E): ResultAsync<A, E> =>
    new ResultAsync(Promise.resolve(err<A, E>(error)));

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

    public then<B, F>(
        onFulfilled?: (result: Result<A, E>) => B | PromiseLike<B>,
        onRejected?: (reason: unknown) => F | PromiseLike<F>,
    ): PromiseLike<B | F> {
        return this.promise.then(onFulfilled, onRejected);
    }
}

export namespace ResultAsync {
    // prettier-ignore
    export function fromPromise<T, F>(somePromise: Promise<T>, onError?: (e: unknown) => F) {
    const promiseResult: Promise<Result<T, F>> = somePromise
      .then(t => ok<T, F>(t))
      .catch(e => {
        if (onError) return err(onError(e));
        return err(e);
      });

    return new ResultAsync(promiseResult);
  }
}
