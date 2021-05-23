import { none, Option, some } from "..";
import { pipe } from "ramda";

describe("Option", () => {
    describe("methods", () => {
        it("construct some and none", () => {
            expect(some(12).getOrNull()).toBe(12);
            expect(none().getOrNull()).toBeNull();
        });

        it("getOrElse", () => {
            expect(some(12).getOrElse(() => 2)).toBe(12);
            expect(none().getOrElse(() => 2)).toBe(2);
        });

        it("map", () => {
            expect(
                some("yolo")
                    .map(a => a.length)
                    .getOrNull(),
            ).toBe(4);

            const optionStr: Option<string> = none();
            expect(optionStr.map(a => a.length).getOrNull()).toBeNull();
        });

        it("flatMap", () => {
            expect(
                some("yolo")
                    .flatMap(a => some(a.length))
                    .getOrNull(),
            ).toBe(4);

            expect(
                some("yolo")
                    .flatMap(() => none())
                    .getOrNull(),
            ).toBeNull();

            const optionStr: Option<string> = none();
            expect(optionStr.map(a => some(a.length)).getOrNull()).toBeNull();
        });

        it("caseOf", () => {
            expect(
                some("yo").caseOf({
                    some: a => a.length,
                    none: () => 0,
                }),
            ).toBe(2);

            const optionStr: Option<string> = none();
            expect(
                optionStr.caseOf({
                    some: a => a.length,
                    none: () => 0,
                }),
            ).toBe(0);
        });
    });

    describe("namespace functions", () => {
        it("from nullable", () => {
            const a: string | null = "bob";
            const b: string | null = null;
            expect(Option.fromNullable(a).getOrNull()).toBe("bob");
            expect(Option.fromNullable(b).getOrNull()).toBe(null);
        });

        it("map", () => {
            const optionA = some("yolo");
            const checkLengthOver2 = pipe<Option<string>, Option<number>, Option<boolean>>(
                Option.map(a => a.length),
                Option.map(aLength => aLength > 2),
            );

            const optionIsLongEnough = checkLengthOver2(optionA);
            expect(optionIsLongEnough.getOrNull()).toBe(true);

            const optionStr = none();

            const optionIsNotLongEnough = checkLengthOver2(optionStr);
            expect(optionIsNotLongEnough.getOrNull()).toBe(null);
        });

        it("flatMap", () => {
            const optionA = some("yolo");
            const checkLengthOver2 = pipe<Option<string>, Option<number>>(
                Option.flatMap(a => some(a.length)),
            );

            expect(checkLengthOver2(optionA).getOrNull()).toBe(4);
            expect(checkLengthOver2(none()).getOrNull()).toBe(null);
        });

        it("caseOf", () => {
            const optionA = some("yolo");
            const lengthOfString = pipe<Option<string>, number>(
                Option.caseOf({
                    some: a => a.length,
                    none: () => 0,
                }),
            );
            expect(lengthOfString(optionA)).toBe(4);
            expect(lengthOfString(none())).toBe(0);
        });
    });
});
