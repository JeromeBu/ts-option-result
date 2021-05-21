import { none, Option, OptionCases, some } from "./option";
import { curry } from "../utils";

export class OptionAsync<A> implements PromiseLike<Option<A>> {
  constructor(private promise: Promise<Option<A>>) {}

  public then<B, E>(
    onFulfilled?: (option: Option<A>) => B | PromiseLike<B>,
    onRejected?: (reason: unknown) => E | PromiseLike<E>
  ): PromiseLike<B | E> {
    return this.promise.then(onFulfilled, onRejected);
  }

  public map<B>(f: (a: A) => B): OptionAsync<B> {
    return new OptionAsync(this.promise.then(Option.map(f)));
  }

  public flatMap<B>(f: (a: A) => Option<B> | OptionAsync<B>): OptionAsync<B> {
    return new OptionAsync(
      this.promise.then(optA =>
        optA.caseOf({
          some: f,
          none,
        })
      )
    );
  }

  public getOrNull(): Promise<A | null> {
    return this.promise.then(Option.getOrNull);
  }

  public getOrElse(f: () => A): Promise<A> {
    return this.promise.then(Option.getOrElse(f));
  }

  public caseOf<B>(cases: OptionCases<A, B>): Promise<B> {
    return this.promise.then(Option.caseOf(cases)).catch(cases.none);
  }

  // flatMap: <B>(f: (a: A) => OptionAsync<B>) => OptionAsync<B>;
  // getOrElse: (f: () => A) => A;
  // getOrNull: () => A | null;
  // caseOf: <B>(cases: OptionCases<A, B>) => B;
}

export const someAsync = <A>(a: A) => new OptionAsync(Promise.resolve(some(a)));
export const noneAsync = <T>() => {
  const t: Option<T> = none();
  return new OptionAsync(Promise.resolve(t));
};

export namespace OptionAsync {
  // prettier-ignore
  export function map<A, B>(f: (a: A) => B, a: OptionAsync<A>): OptionAsync<B>;
  // prettier-ignore
  export function map<A, B>(f: (a: A) => B): (a: OptionAsync<A>) => OptionAsync<B>;
  export function map<A, B>(f: (a: A) => B, optAsyncA?: OptionAsync<A>): any {
    return curry((optAsync: OptionAsync<A>) => optAsync.map(f), optAsyncA);
    // if (!optAsyncA) return (optAsync: OptionAsync<A>) => optAsync.map(f);
    // return optAsyncA.map(f);
  }

  // prettier-ignore
  export function flatMap<A, B>(f: (a: A) => (Option<B> | OptionAsync<B>), a: OptionAsync<A>): OptionAsync<B>;
  // prettier-ignore
  export function flatMap<A, B>(f: (a: A) => (Option<B> | OptionAsync<B>)): (a: OptionAsync<A>) => OptionAsync<B>;
  export function flatMap<A, B>(
    f: (a: A) => Option<B> | OptionAsync<B>,
    optAsyncA?: OptionAsync<A>
  ): any {
    return curry((optAsync: OptionAsync<A>) => optAsync.flatMap(f), optAsyncA);
  }

  export function getOrNull<A>(optAsyncA: OptionAsync<A>): Promise<A | null> {
    return optAsyncA.getOrNull();
  }

  // prettier-ignore
  export function getOrElse<A>(f: () => A, optAsyncA: OptionAsync<A>): Promise<A>;
  // prettier-ignore
  export function getOrElse<A>(f: () => A): (optAsyncA: OptionAsync<A>) => Promise<A>;
  export function getOrElse<A>(f: () => A, optAsyncA?: OptionAsync<A>): any {
    return curry((option: OptionAsync<A>) => option.getOrElse(f), optAsyncA);
  }

  // prettier-ignore
  export function caseOf<A, B>(cases: OptionCases<A, B>, optAsyncA: OptionAsync<A>): Promise<B>
  // prettier-ignore
  export function caseOf<A, B>(cases: OptionCases<A, B>): (optAsyncA: OptionAsync<A>) => Promise<B>
  export function caseOf<A, B>(
    cases: OptionCases<A, B>,
    optAsyncA?: OptionAsync<A>
  ): any {
    return curry(optionAsync => optionAsync.caseOf(cases), optAsyncA);
  }
}
