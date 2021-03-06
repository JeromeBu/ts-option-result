import { err, ok, Result, combine, chain } from "..";

import { expectErr, expectOk } from "./helpers";

describe("Result", () => {
    describe("methods", () => {
        it("construct ok and err", () => {
            expectOk(ok(10), 10);
            expectErr(err("some failure"), "some failure");
        });

        it("getOrThrow", () => {
            expect(ok(10).getOrThrow()).toBe(10);
            expect(() => err("some failure").getOrThrow()).toThrowError("some failure");
        });
        it("_getErrorOrThrow", () => {
            expect(() => ok(10)._getErrorOrThrow()).toThrowError("Cannot get error on Ok value");
            expect(err("some failure")._getErrorOrThrow()).toBe("some failure");
        });

        it("isOk", () => {
            expect(ok(10).isOk()).toBe(true);
            expect(err("some failure").isOk()).toBe(false);
        });

        it("isErr", () => {
            expect(ok(10).isErr()).toBe(false);
            expect(err("some failure").isErr()).toBe(true);
        });

        it("map", () => {
            const okStr = ok("yolo");
            expectOk(
                okStr.map(str => str.length),
                4,
            );

            const errStr: Result<string, string> = err("some error");
            expectErr(
                errStr.map(str => str.length),
                "some error",
            );
        });

        it("flatMap", () => {
            const okStr = ok("yolo");
            expectOk(
                okStr.flatMap(str => ok(str.length)),
                4,
            );

            expectErr(
                okStr.flatMap(_ => err("string is to short")),
                "string is to short",
            );

            expectErr(
                err<string, string>("a failure").flatMap(a => ok(a.length)),
                "a failure",
            );
        });

        it("caseOf", () => {
            const okStr = ok("yolo");
            const fine = okStr.caseOf({
                err: () => "Failed",
                ok: a => `success ${a}`,
            });
            expect(fine).toBe("success yolo");

            const errStr: Result<string, string> = err("my mistake");
            const failed = errStr.caseOf({
                err: e => "Failed with " + e,
                ok: () => "success",
            });
            expect(failed).toBe("Failed with my mistake");
        });
    });
    describe("namespace functions", () => {
        it("from nullable", () => {
            const str = "yo" as string | null;
            const nullStr = null as string | null;

            const partiallyExecutedFromNullable = Result.fromNullable("something wrong");
            expectOk(partiallyExecutedFromNullable(str), "yo");
            expectErr(partiallyExecutedFromNullable(nullStr), "something wrong");
        });
        it("map", () => {
            const okStr: Result<string, Error> = ok("yolo");
            const isLongEnough = (result: Result<string, Error>) =>
                chain(
                    result,
                    Result.map(str => str.length),
                    Result.map(len => len > 3),
                );

            expectOk(isLongEnough(okStr), true);

            const errStr: Result<string, Error> = err(new Error("some error"));
            expectErr(isLongEnough(errStr), new Error("some error"));
        });

        it("flatMap", () => {
            const okStr: Result<string, "something wrong"> = ok("yolo");
            const isLongEnoughWithError = (result: Result<string, "something wrong">) =>
                chain(
                    result,
                    Result.map(str => str.length),
                    Result.flatMap((len): Result<void, "something wrong" | "to short"> => {
                        if (len < 3) return err("to short");
                        return ok();
                    }),
                );

            expectOk(isLongEnoughWithError(okStr), undefined);
            expectErr(isLongEnoughWithError(ok("yo")), "to short");
        });

        it("caseOf", () => {
            const okA: Result<{ n: number }, string> = ok({ n: 2 });

            // <Result<{ n: number }, string>, Result<number, string>, string>
            const goodOrBad = (result: Result<{ n: number }, string>) =>
                chain(
                    result,
                    Result.map(obj => obj.n),
                    Result.caseOf({
                        ok: n => "Good " + n,
                        err: e => "Bad " + e,
                    }),
                );

            const badB: Result<{ n: number }, string> = err("mistake");

            expect(goodOrBad(okA)).toBe("Good 2");
            expect(goodOrBad(badB)).toBe("Bad mistake");
        });
    });

    it("combine results", () => {
        const okA: Result<number, "error A"> = ok(10);
        const okB: Result<boolean, "error B"> = ok(true);
        const errA: Result<number, "error A"> = err("error A");
        const errB: Result<boolean, "error B"> = err("error B");

        expectOk(combine({ resultA: okA, resultB: okB }), { resultA: 10, resultB: true });
        expectErr(combine({ resultA: okA, resultB: errB }), "error B");
        expectErr(combine({ resultA: errA, resultB: okB }), "error A");
        expectErr(combine({ resultA: errA, resultB: errB }), "error A");
    });
});
