import { none, Option, some, fromNullable } from "..";
import { expectErr, expectOk } from "./helpers";
import { chain } from "../lib/chain";

describe("Option", () => {
    describe("methods", () => {
        it("construct some and none", () => {
            expect(some(12).getOrNull()).toBe(12);
            expect(some(12).isNone()).toBe(false);
            expect(none().getOrNull()).toBeNull();
            expect(none().isNone()).toBe(true);
        });

        it("from nullable", () => {
            const a: string | null = "bob";
            const b: string | null = null;
            expect(fromNullable(a).getOrNull()).toBe("bob");
            expect(fromNullable(b).getOrNull()).toBe(null);
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

        it("toResult", () => {
            const someString = some("my str");
            const noneString: Option<string> = none();
            expectOk(someString.toResult("No string"), "my str");
            expectErr(noneString.toResult("No string"), "No string");
        });
    });

    describe("namespace functions", () => {
        it("map", () => {
            const optionA = some("yolo");

            const checkLengthOver2 = (option: Option<string>) =>
                chain(
                    option,
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
            const checkLengthOver2 = (option: Option<string>) =>
                chain(
                    option,
                    Option.flatMap(a => some(a.length)),
                );

            expect(checkLengthOver2(optionA).getOrNull()).toBe(4);
            expect(checkLengthOver2(none()).getOrNull()).toBe(null);
        });

        it("caseOf", () => {
            const optionA = some("yolo");
            const getLengthOfString = Option.caseOf<string, unknown>({
                some: a => a.length,
                none: () => 0,
            });

            expect(getLengthOfString(optionA)).toBe(4);
            expect(getLengthOfString(none())).toBe(0);
        });

        it("toResult", () => {
            const someString = some("my str");
            const noneString: Option<string> = none();
            const toResultWithErr = Option.toResult<string, string>("No string");
            expectOk(toResultWithErr(someString), "my str");
            expectOk(Option.toResult("No string", someString), "my str");
            expectErr(toResultWithErr(noneString), "No string");
        });
    });
});
