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


# Option

This is a typical case where Option can help you.

```typescript
const getString: () => string | null;

const lengthIfStringIsPresent = (): number | null => {
    const strOrNull = getString();
    if (!strOrNull) return null;
    return strOrNull.length;
};
```

Using Option :

```typescript
import { Option } from "ts-option-result";

const getString: () => Option<string>; // exemple: () => some("a random string")

const checkIfBobStringIsLongEnough = (): Option<number> => {
    return getString().map(str => str.length);
};

// or step by step :
// const checkIfBobStringIsLongEnough = (): Option<number> => {
//     const optionStr = getString();
//     const optionLength = optionStr.map(str => str.length)
//     return optionLength
// }
```

You can chain Options using map and flatMap, and only unWrap at the very end of your process.

```typescript
import { Option } from "ts-option-result";

type Person = {
    name: string;
    father: Option<Person>;
};

const getFatherName = (optionPerson: Option<Person>) => {
    return optionPerson
        .flatMap(person => person.father)
        .map(father => father.name)
        .caseOf({
            none: () => "Not relevant",
            some: fatherName => `Father's name is ${fatherName}`,
        });
};
```

Which could also be written with point free style (pipe function is the one from [Ramda](https://ramdajs.com/docs/#pipe)):

```typescript
import { Option } from "ts-option-result";

const getFaterName = pipe<Option<Person>, Option<Person>, Option<string>, string>(
    Option.flatMap(person => person.father),
    Option.map(father => father.name),
    Option.caseOf({
        none: () => "Not relevant",
        some: fatherName => `Father's name is ${fatherName}`,
    }),
);
```
