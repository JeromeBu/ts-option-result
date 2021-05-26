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

### Constructors

-   some
-   none
-   fromNullable

### Functions and methods

-   isNone
-   map
-   flatMap
-   caseOf
-   getOrElse
-   getOrNull

## OptionAsync

### Constructor

-   someAsync
-   noneAsync

### Functions and methods

-   map
-   flatMap
-   caseOf
-   getOrElse
-   getOrNull

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
-   TODO : ...still to methods to be added...

## Option

### Constructors

`type Option<T> = Some<T> | None`

`Option` can either be `Some<T>` or `None`, there are 3 constructors.

-   `some: T => Some<T>` creates a `Some<T>` instance
-   `none: () => None`
-   `fromNullable: (T | null | undefined) => Option<T>` creates an option from a nullable of T

```typescript
import { some, none, Option } from "ts-option-result";
import { fromNullable } from "./option";

const someStr: Option<string> = some("my string");
const noneStr: Option<string> = none();

const myString = "my nullable string" as string | null | undefined;
const optionStr = fromNullable(myString);
```

### Function and instance methods

Option instance have several methods:

#### map:

function: `(f: A => B) -> Option<A> -> Option<B>`

```typescript
const optionStr = some("my string");

// instance method
const optionNum = optionStr.map(str => str.length); // Option<number>

// curried function
const optionNum = Option.map(str => str.length, optionStr); // Option<number>
```

<br />

#### flatMap:

function: `(f: A => Option<B>) -> Option<A> -> Option<B>`

```typescript
const optionStr = some("my string");

// curried function
const optionNum = Option.map(str => some(str.length), optionStr); // Option<number>

// instance method
const optionNum = optionStr.flatMap(str => some(str.length)); // Option<number>
```

<br />

#### caseOf:

function: `({some: A => B, none: () => B}) -> Option<A> -> B`

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

#### getOrElse:

function: `(f: () => A) -> Option<A> -> A`

```typescript
const optionStr = some("my string");

// curried function
const myString = Option.getOrElse(() => "No string", optionStr);

// instance method
const myString = optionStr.getOrElse(() => "No string");
```

<br />

#### getOrNull:

function: `Option<A> -> A | null`

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

TODO: write documentation

## Result

TODO: write documentation

## ResultAsync

TODO: write documentation
