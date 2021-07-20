import { none, Option, some, noneAsync, OptionAsync, someAsync, fromOption, chain } from "..";

describe("OptionAsync", () => {
    describe("methods", () => {
        it("construct some and none", async () => {
            expect(await someAsync(12).getOrNull()).toBe(12);
            expect(await noneAsync().getOrNull()).toBeNull();
        });

        it("construct fromOption", async () => {
            expect(await fromOption(some(10)).getOrNull()).toBe(10);
            expect(await fromOption(none()).getOrNull()).toBeNull();
        });

        it("getOrElse", async () => {
            expect(await someAsync(12).getOrElse(() => 0)).toBe(12);
            expect(await noneAsync().getOrElse(() => 0)).toBe(0);
        });

        it("map", async () => {
            expect(
                await someAsync("yolo")
                    .map(a => a.length)
                    .then(Option.getOrNull),
            ).toBe(4);
            const optionStr = noneAsync<string>();
            expect(await optionStr.map(a => a.length).then(Option.getOrNull)).toBeNull();
        });

        it("flatMap", async () => {
            expect(
                await someAsync("yolo")
                    .flatMap(a => someAsync(a.length))
                    .getOrNull(),
            ).toBe(4);

            expect(
                await someAsync("yolo")
                    .flatMap(() => none())
                    .getOrNull(),
            ).toBeNull();

            const optionStr: Option<string> = none();
            expect(optionStr.flatMap(a => some(a.length)).getOrNull()).toBeNull();
        });

        it("caseOf", async () => {
            expect(
                await someAsync("yo").caseOf({
                    some: a => a.length,
                    none: () => 0,
                }),
            ).toBe(2);

            const optionAsyncStr = noneAsync<string>();
            expect(
                await optionAsyncStr.caseOf({
                    some: a => a.length,
                    none: () => 0,
                }),
            ).toBe(0);
        });
    });

    describe("namespace functions", () => {
        it("map", async () => {
            const optionAsyncA = someAsync("yolo");
            const checkLengthOver2 = (optionAsync: OptionAsync<string>) =>
                chain(
                    optionAsync,
                    OptionAsync.map(a => a.length),
                    OptionAsync.map(aLength => aLength > 2),
                );

            const optionIsLongEnough = checkLengthOver2(optionAsyncA);
            expect(await optionIsLongEnough.getOrNull()).toBe(true);

            const optionStr = noneAsync<string>();

            const optionIsNotLongEnough = checkLengthOver2(optionStr);
            expect(await optionIsNotLongEnough.getOrNull()).toBe(null);
        });

        it("flatMap", async () => {
            const optionA = someAsync("yolo");
            const lengthOfString = (optionAsync: OptionAsync<string>) =>
                chain(
                    optionAsync,
                    OptionAsync.flatMap(a => some(a.length)),
                    OptionAsync.map(aLength => aLength > 2),
                );

            expect(await lengthOfString(optionA).getOrNull()).toBe(true);
            expect(await lengthOfString(noneAsync()).getOrNull()).toBe(null);
        });

        it("caseOf", async () => {
            const optionAsyncA = someAsync("yolo");
            const checkLengthOver2 = (optionAsync: OptionAsync<string>) =>
                chain(
                    optionAsync,
                    OptionAsync.flatMap(a => some(a.length)),
                    OptionAsync.caseOf({
                        some: aLength => aLength > 2,
                        none: () => false,
                    }),
                );

            expect(await checkLengthOver2(optionAsyncA)).toBe(true);
            expect(await checkLengthOver2(noneAsync())).toBe(false);
        });

        it("getOrElse", async () => {
            const getOr0 = OptionAsync.getOrElse(() => 0);
            expect(await getOr0(someAsync(12))).toBe(12);
            expect(await getOr0(noneAsync())).toBe(0);
        });

        it("getOrNull", async () => {
            expect(await OptionAsync.getOrNull(someAsync(12))).toBe(12);
            expect(await OptionAsync.getOrNull(noneAsync())).toBe(null);
        });
    });
});
