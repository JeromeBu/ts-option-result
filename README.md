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

### Constructors:

-   ok
-   err

### Functions and methods

-   isOk
-   isErr
-   map
-   flatMap
-   caseOf
-   getOrThrow
-   getErrorOrThrow

## ResultAsync

### Constructors:

-   someAsync
-   noneAsync
-   fromPromise

### Functions and methods

-   map
-   flatMap
-   TODO : ...still to methods to be added..

Most methods have an equivalent function, which is curried. The usage depends on weather you like chaining methods or piping functions. The pipe function used below is the one from [Ramda](https://ramdajs.com/docs/#pipe)

```typescript
const optionAge = some(25);

class NoEmailFoundError extends Error {}
class NoAgeProvidedError extends Error {}
class NotOldEnoughError extends Error {}
let getEmail: () => Result<string, NoEmailFoundError>;

// Method chaining:
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

// Equivalent with pipe :
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
You can await OptionAsync just like a promise.

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
const optionAsyncNum = OptionAsync.map(str => str.length, someAsyncStr);

// instance method
const optionAsyncNum = someAsyncStr.map(str => str.length);
```

<br/>

#### OptionAsync - flatMap

`(f: A => Option<B> | OptionAsync<B>) -> OptionAsync<A> -> OptionAsync<B>`

The function provided to flatMap can either return Option<B> or OptionAsync<B>

```typescript
const someAsyncStr = someAsync("my string");

// curried function
const optionAsyncNum = OptionAsync.map(str => some(str.length), someAsyncStr);

// instance method
const optionAsyncNum = someAsyncStr.map(str => someAsync(str.length));
```

<br/>

#### OptionAsync - caseOf

`({some: A => B, none: () => B}) -> OptionAsync<A> -> Promise<B>`

The function provided to flatMap can either return Option<B> or OptionAsync<B>

```typescript
const optionAsyncStr = someAsync("my string");

// curried function
const lengthOfString: Promise<number> = OptionAsync.caseOf(
    {
        some: str => str.length,
        none: () => 0,
    },
    optionAsyncStr,
);

// instance method
const lengthOfString: Promise<number> = optionStr.flatMap({
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
const optionAsyncNum = OptionAsync.getOrElse(() => "No string", someAsyncStr);

// instance method
const optionAsyncNum = someAsyncStr.getOrElse(() => "No string");
```

<br/>

#### OptionAsync - getOrNull

`OptionAsync<A> -> Promise<A | null>`

```typescript
const someAsyncStr = someAsync("my string");

// curried function
const optionAsyncNum = OptionAsync.getOrNull(someAsyncStr);

// instance method
const optionAsyncNum = someAsyncStr.getOrNull();
```

<br/>

## Result

TODO: write documentation

## ResultAsync

TODO: write documentation
