import { pipe } from "ramda";
import { err, ok, Result } from "..";

import { expectErr, expectOk } from "./helpers";

describe("Result", () => {
    describe("methods", () => {
        it("construct ok and err", () => {
            expectOk(ok(10), 10);
            expectErr(err("some failure"), "some failure");
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
        it("map", () => {
            const okStr: Result<string, Error> = ok("yolo");
            const isLongEnough = pipe<
                Result<string, Error>,
                Result<number, Error>,
                Result<boolean, Error>
            >(
                Result.map(str => str.length),
                Result.map(len => len > 3),
            );

            expectOk(isLongEnough(okStr), true);

            const errStr: Result<string, Error> = err(new Error("some error"));
            expectErr(isLongEnough(errStr), new Error("some error"));
        });

        it("flatMap", () => {
            const okStr: Result<string, "something wrong"> = ok("yolo");
            const isLongEnoughWithError = pipe<
                Result<string, "something wrong">,
                Result<number, "something wrong">,
                Result<void, "something wrong" | "to short">
            >(
                Result.map(str => str.length),
                Result.flatMap(len => {
                    if (len < 3) return err("to short");
                    return ok();
                }),
            );

            expectOk(isLongEnoughWithError(okStr), undefined);
            expectErr(isLongEnoughWithError(ok("yo")), "to short");
        });

        it("caseOf", () => {
            const okA: Result<{ n: number }, string> = ok({ n: 2 });
            const goodOrBad = pipe<Result<{ n: number }, string>, Result<number, string>, string>(
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
});
