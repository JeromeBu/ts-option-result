ts-option-result provides is a small library to handle null cases and error cases in a clean way.

Option and OptionAsync are used to handle cases of nullity.
Result and ResultAsync are used for error handling in a descriptive and type safe way.

<p align="center">
    <i></i>
    <br>
    <br>
    <img src="https://github.com/jeromebu/ts-option-result/workflows/ci/badge.svg?branch=main">
    <img src="https://img.shields.io/bundlephobia/minzip/ts-option-result">
    <img src="https://img.shields.io/npm/dw/ts-option-result">
    <img src="https://img.shields.io/npm/l/ts-option-result">
</p>

# Install / Import

```bash
$ npm install --save ts-option-result
```

## Usage example

Most methods have an equivalent function, which is curried.
The usage depends on weather you like chaining methods or piping functions.
The pipe function used below is the one from [Ramda](https://ramdajs.com/docs/#pipe)

```typescript
const optionAge = some(25);

class NoEmailFoundError extends Error {}
class NoAgeProvidedError extends Error {}
class NotOldEnoughError extends Error {}
let getEmail: () => Result<string, NoEmailFoundError>;

// Usage with methods chaining:
optionAge // Option<number>
    .toResult(new NoAgeProvidedError()) // Result<number, NoAgeProvidedError>
    .flatMap((age): Result<number, NotOldEnoughError> => {
        if (age < 20) return err(new NotOldEnoughError());
        return ok(age);
    }) // Result<number, NoAgeProvidedError | NotOldEnoughError>
    .flatMap(oldEnoughAge =>
        getEmail().map(email => ({
            email,
            age: oldEnoughAge,
        })),
    ) // Result<{email: string, age: number}, NoAgeProvidedError | NotOldEnoughError | NoEmailFoundError>
    .caseOf({
        ok: user => `User with ${user.email} email, is ${user.age} years old`,
        err: err => `Something wrong happened: ${err.message}`,
    }); // string

// Usage with piping (pipe function from ramda):
pipe<
    Option<number>,
    Result<number, NoAgeProvidedError>,
    Result<number, NoAgeProvidedError | NotOldEnoughError>,
    Result<{ email: string; age: number }, NoAgeProvidedError | NotOldEnoughError | NoEmailFoundError>,
    string
>(
    Option.toResult(new NoAgeProvidedError()),
    Result.flatMap((age): Result<number, NotOldEnoughError> => {
        if (age < 20) return err(new NotOldEnoughError());
        return ok(age);
    }),
    Result.flatMap(oldEnoughAge =>
        getEmail().map(email => ({
            email,
            age: oldEnoughAge,
        })),
    ),
    Result.caseOf({
        ok: user => `User with ${user.email} email, is ${user.age} years old`,
        err: err => `Something wrong happened: ${err.message}`,
    }),
)(optionAge);
```

# API

## Option

### [Constructors](#option---constructors)

-   some `T => Some<T>`
-   none `() => None`
-   fromNullable `(T | null | undefined) => Option<T>`

### [Functions and methods](#option---function-and-instance-methods)

-   [isNone](#option---isnone) `Option<A> -> boolean`
-   [map](#option---map) `(f: A => B) -> Option<A> -> Option<B>`
-   [flatMap](#option---flatmap) `(f: A => Option<B>) -> Option<A> -> Option<B>`
-   [caseOf](#option---caseof) `({some: A => B, none: () => B}) -> Option<A> -> B`
-   [getOrElse](#option---getorelse) `(f: () => A) -> Option<A> -> A`
-   [getOrNull](#option---getornull) `Option<A> -> A | null`

## OptionAsync

### [Constructors](#optionasync---constructors)

-   someAsync `A => OptionAsync<A>`
-   noneAsync `() => OptionAsync<A>`

### [Functions and methods](#optionasync---function-and-instance-methods)

-   [map](#optionasync---map) `(f: A => B) -> OptionAsync<A> -> OptionAsync<B>`
-   [flatMap](#optionasync---flatmap) `(f: A => Option<B> | OptionAsync<B>) -> OptionAsync<A> -> OptionAsync<B>`
-   [caseOf](#optionasync---caseof) `({some: A => B, none: () => B}) -> OptionAsync<A> -> Promise<B>`
-   [getOrElse](#optionasync---getorelse) `(f: () => B) -> OptionAsync<A> -> Promise<B>`
-   [getOrNull](#optionasync---getornull) `OptionAsync<A> -> Promise<A | null>`

## Result

### [Constructors](#result---constructors)

-   ok
-   err

### [Functions and methods](#result---function-and-instance-methods)

-   [isOk](#result---isok)
-   [isErr](#result---iserr)
-   [map](#result---map)
-   [flatMap](#result---flatmap)
-   [caseOf](#result---caseof)
-   [getOrThrow](#result---getorthrow)
-   [getErrorOrThrow](#result---geterrororthrow)

## ResultAsync

### [Constructors](#resultasync---constructors)

-   okAsync
-   errAsync
-   [fromPromise](#resultasync---constructors)

### Functions and methods

-   [map](#resultasync---map)
-   [flatMap](#resultasync---flatmap)
-   [caseOf](#resultasync---caseof)

## Option

### Option - Constructors

`type Option<T> = Some<T> | None`

`Option` can either be `Some<T>` or `None`, there are 3 constructors.

-   `some: T => Some<T>` creates a `Some<T>` instance
-   `none: () => None`
-   `fromNullable: (T | null | undefined) => Option<T>` creates an option from a nullable of T

```typescript
import { some, none, Option, fromNullable } from "ts-option-result";

const someStr: Option<string> = some("my string");
const noneStr: Option<string> = none();

const myString = "my nullable string" as string | null | undefined;
const optionStr = fromNullable(myString);
```

### Option - Function and instance methods

#### Option - isNone

`Option<A> -> boolean`

```typescript
const someStr = some("my string");
const noneStr = none();

// instance method
const isFalse = someStr.isNone();
const isTrue = noneStr.isNone();
```

#### Option - map

`(f: A => B) -> Option<A> -> Option<B>`

```typescript
const optionStr = some("my string");

// curried function
const optionNum = Option.map(str => str.length, optionStr); // Option<number>

// instance method
const optionNum = optionStr.map(str => str.length); // Option<number>
```

<br />

#### Option - flatMap:

`(f: A => Option<B>) -> Option<A> -> Option<B>`

```typescript
const optionStr = some("my string");

// curried function
const optionNum = Option.map(str => some(str.length), optionStr); // Option<number>

// instance method
const optionNum = optionStr.flatMap(str => some(str.length)); // Option<number>
```

<br />

#### Option - caseOf:

`({some: A => B, none: () => B}) -> Option<A> -> B`

```typescript
const optionStr = some("my string");

// curried function
const lengthOfString: number = Option.caseOf(
    {
        some: str => str.length,
        none: () => 0,
    },
    optionStr,
);

// instance method
const lengthOfString: number = optionStr.flatMap({
    some: str => str.length,
    none: () => 0,
});
```

<br />

#### Option - getOrElse:

`(f: () => A) -> Option<A> -> A`

```typescript
const optionStr = some("my string");

// curried function
const myString = Option.getOrElse(() => "No string", optionStr);

// instance method
const myString = optionStr.getOrElse(() => "No string");
```

<br />

#### Option - getOrNull:

`Option<A> -> A | null`

```typescript
const optionStr = some("my string");

// curried function
const myString = Option.getOrNull(optionStr); // const myString = "my string"
const myNull = Option.getOrNull(none()); // const myNull = null

// instance method
const myString = optionStr.getOrNull(); // const myString = "my string"
const myNull = none().getOrNull(); // const myNull = null
```

<br />

## OptionAsync

OptionAsync is a wrapper around promises. It is similar to Promise<Option<A>> with extra methods.
You can use `then` and `await` on OptionAsync just like a promise.

### OptionAsync - Constructors

-   `someAsync: T => OptionAsync<T>`
-   `noneAsync: () => OptionAsync<T>`

```typescript
import { someAsync, noneAsync, OptionAsync } from "ts-option-result";

const someAsyncStr: OptionAsync<string> = someAsync("my string");
const noneAsyncStr: OptionAsync<string> = noneAsync();
```

<br/>

### OptionAsync - Function and instance methods

#### OptionAsync - map

`(f: A => B) -> OptionAsync<A> -> OptionAsync<B>`

```typescript
const someAsyncStr = someAsync("my string");

// curried function
const resultAsyncNum = OptionAsync.map(str => str.length, someAsyncStr);

// instance method
const resultAsyncNum = someAsyncStr.map(str => str.length);
```

<br/>

#### OptionAsync - flatMap

`(f: A => Option<B> | OptionAsync<B>) -> OptionAsync<A> -> OptionAsync<B>`

The function provided to flatMap can either return Option<B> or OptionAsync<B>

```typescript
const someAsyncStr = someAsync("my string");

// curried function
const resultAsyncNum = OptionAsync.map(str => some(str.length), someAsyncStr);

// instance method
const resultAsyncNum = someAsyncStr.map(str => someAsync(str.length));
```

<br/>

#### OptionAsync - caseOf

`({some: A => B, none: () => B}) -> OptionAsync<A> -> Promise<B>`

The function provided to flatMap can either return Option<B> or OptionAsync<B>

```typescript
const someAsyncStr = someAsync("my string");

// curried function
const lengthOfString: Promise<number> = OptionAsync.caseOf(
    {
        some: str => str.length,
        none: () => 0,
    },
    someAsyncStr,
);

// instance method
const lengthOfString: Promise<number> = someAsyncStr.caseOf({
    some: str => str.length,
    none: () => 0,
});
```

<br/>

#### OptionAsync - getOrElse

`(f: () => B) -> OptionAsync<A> -> Promise<B>`

```typescript
const someAsyncStr = someAsync("my string");

// curried function
const resultAsyncNum = OptionAsync.getOrElse(() => "No string", someAsyncStr);

// instance method
const resultAsyncNum = someAsyncStr.getOrElse(() => "No string");
```

<br/>

#### OptionAsync - getOrNull

`OptionAsync<A> -> Promise<A | null>`

```typescript
const someAsyncStr = someAsync("my string");

// curried function
const resultAsyncNum = OptionAsync.getOrNull(someAsyncStr);

// instance method
const resultAsyncNum = someAsyncStr.getOrNull();
```

<br/>

## Result

### Result - Constructors

`type Result<A, E> = Ok<A, E> | Err<A, E>`

`Result` can either be `Ok<A, E>` or `Err<A, E>`, there are 2 constructors.

-   `ok: A => Ok<A, unknown>` creates a `Ok<A, unknown>` instance
-   `err: E => Err<unknown, E>`

```typescript
import { ok, err, Result } from "ts-option-result";

const okStr = ok("my string");
const errStr = err("some error");

// you can provide an expected type for the E or T :
const okNum: Result<number, string> = ok(10);
const errNum: Result<number, string> = err("some error");
```

<br/>

### Result - Function and instance methods

#### Result - isOk

`Option<A> -> boolean`

```typescript
const okStr = ok("my string");
const errStr = err();

// instance method
const thisIsTrue = okStr.isOk();
const thisIsFalse = errStr.isOk();
```

<br />

#### Result - isErr

`Result<A, E> -> boolean`

```typescript
const okStr = ok("my string");
const errStr = err();

// instance method
const thisIsFalse = okStr.isErr();
const thisIsTrue = errStr.isErr();
```

<br/>

#### Result - map

`(f: A => B) -> Result<A, E> -> Result<B, E>`

```typescript
const okStr: Result<string, string> = ok("my string");

// curried function
const okNum = Result.map(str => str.length, okStr); // Result<number, string>

// instance method
const okNum = okStr.map(str => str.length); // Result<number, string>
```

#### Result - flatMap

`(f: A => Result<B, F>) -> Result<A, E> -> Result<B, E | F>`

```typescript
const okStr: Result<string, "anError"> = ok("my string");

// curried function
const okNum = Result.flatMap(str => {
    if (str.length > 2) return ok(str.length);
    return err("NotLongEnough");
}, okStr); // Result<number, "anError" | "NotLongEnough">

// instance method
const okNum = okStr.flatMap(str => {
    if (str.length > 2) return ok(str.length);
    return err("NotLongEnough");
}); // Result<number, "anError" | "NotLongEnough">
```

<br/>

#### Result - caseOf:

`({ok: A => B, err: () => B}) -> Result<A, E> -> B`

```typescript
const okStr: Result<string, string> = some("my string");

// curried function
const lengthOfString: number = Result.caseOf(
    {
        ok: str => str.length,
        err: e => {
            console.error("Error : " + e);
            return 0;
        },
    },
    okStr,
);

// instance method
const lengthOfString: number = okStr.caseOf({
    ok: str => str.length,
    err: e => {
        console.error("Error : " + e);
        return 0;
    },
});
```

<br />

#### Result - getOrThrow

`Result<A, E> -> Promise<A>` (but may also throw E)

```typescript
const okStr = ok("my string");
const errStr: Result<number, string> = err("FAILURE !");

// curried function
const num = Result.getOrThrow(okStr); // returns "my string"
Result.getOrThrow(errStr); // throws "FAILURE !"

// instance method
const okNum = okStr.getOrThrow(); // returns "my string";
errStr.getOrThrow(); // throws "FAILURE !"
```

#### Result - getErrorOrThrow

`Result<A, E> -> Promise<E>` (but may also throw E)

Careful with this, as it will throw on OK values. It should only be used after an `isErr` check.

```typescript
const okStr = ok("my string");
const errStr: Result<number, string> = err("My error");

// curried function
Result._getErrorOrThrow(okStr); // throws "Cannot get error on Ok value"
const stringInErr = Result._getErrorOrThrow(errStr); // returns "My error"

// instance method
okStr._getErrorOrThrow(); // throws "Cannot get error on Ok value"
const stringInErr = errStr._getErrorOrThrow(); // returns "My error"
```

## ResultAsync

ResultAsync is a wrapper around promises. It is similar to Promise<Result<A, E>> with extra methods.
You can use `then` and `await` on ResultAsync just like a promise.

### ResultAsync - Constructors

-   `okAsync: T => ResultAsync<T, unknown>`
-   `errAsync: E => ResultAsync<unknown, E>`
-   `fromPromise: Promise<A> => ResultAsync<A, unknown> -- or -- (Promise<A>, errHandler: () => F) => ResultAsync<A, F>`

```typescript
import { okAsync, noneAsync, ResultAsync, fromPromise } from "ts-option-result";

const okAsyncStr: ResultAsync<string> = okAsync("my string");
const noneAsyncStr: ResultAsync<string> = noneAsync();

const resolveStr = Promise.resolve("myStr");
const okAsyncStr = fromPromise(resolveStr);

const rejectStr: Promise<string> = Promise.reject("failure");
const errAsyncStr = fromPromise(rejectStr2, e => "error was " + e);
```

<br/>

### ResultAsync - Function and instance methods

#### ResultAsync - map

`(f: A => B) -> ResultAsync<A, E> -> ResultAsync<B, E>`

```typescript
const okAsyncStr = okAsync("my string");

// curried function
const resultAsyncNum = ResultAsync.map(str => str.length, okAsyncStr);

// instance method
const resultAsyncNum = okAsyncStr.map(str => str.length);
```

<br/>

#### ResultAsync - flatMap

`(f: A => Result<B, F> | ResultAsync<B, F>) -> ResultAsync<A, E> -> ResultAsync<B, E | F>`

The function provided to flatMap can either return Result<B, F> or ResultAsync<B, F>

```typescript
const okAsyncStr = okAsync("my string");

// curried function
const resultAsyncNum = ResultAsync.map(str => some(str.length), okAsyncStr);

// instance method
const resultAsyncNum = okAsyncStr.map(str => okAsync(str.length));
```

<br/>

#### ResultAsync - caseOf

`({ok: A => B, err: () => B}) -> ResultAsync<A, E> -> Promise<B>`

```typescript
const okAsyncStr = okAsync("my string");

// curried function
const lengthOfString: Promise<number> = ResultAsync.caseOf(
    {
        ok: str => str.length,
        err: e => {
            console.error(e);
            return 0;
        },
    },
    okAsyncStr,
);

// instance method
const lengthOfString: Promise<number> = okAsyncStr.caseOf({
    ok: str => str.length,
    err: () => 0,
});
```

<br/>
