import { err, errAsync, fromPromise, ok, okAsync, Result, ResultAsync, fromResult } from "..";
import { expectErrAsync, expectOkAsync } from "./helpers";

describe("ResultAsync", () => {
    describe("methods", () => {
        it("construct okAsync and errAsync", async () => {
            await expectOkAsync(fromResult(ok(10)), 10);
            await expectOkAsync(okAsync(12), 12);
            await expectErrAsync(errAsync("failed"), "failed");
        });

        it("fromPromise", async () => {
            const resolveStr = Promise.resolve("myStr");
            const okAsyncStr = fromPromise(resolveStr);
            await expectOkAsync(okAsyncStr, "myStr");

            const rejectStr: Promise<string> = Promise.reject("failure");
            const errAsyncStr = fromPromise(rejectStr);
            await expectErrAsync(errAsyncStr, "failure");

            const rejectStr2: Promise<string> = Promise.reject("failure");
            const errAsyncStr2 = fromPromise(rejectStr2, e => "error was " + e);
            await expectErrAsync(errAsyncStr2, "error was failure");
        });

        it("map", async () => {
            await expectOkAsync(
                okAsync("yolo").map(a => a.length),
                4,
            );
            const resultStr = errAsync<string, string>("failed");
            await expectErrAsync(
                resultStr.map(a => a.length),
                "failed",
            );
        });

        it("flatMap", async () => {
            await expectOkAsync(
                okAsync("yolo").flatMap(a => okAsync(a.length)),
                4,
            );
            await expectOkAsync(
                okAsync("yolo").flatMap(a => ok(a.length)),
                4,
            );

            await expectErrAsync(
                okAsync("yolo").flatMap(() => errAsync("failed")),
                "failed",
            );

            const resultStr: ResultAsync<string, string> = errAsync("other failed 2");
            await expectErrAsync(
                resultStr.flatMap(a => ok(a.length)),
                "other failed 2",
            );
        });

        it("caseOf", async () => {
            const okAsyncStr = okAsync<number, string>(12);
            const okStr = await okAsyncStr.caseOf({
                ok: n => `Number is ${n}`,
                err: e => `something wrong happened: ${e}`,
            });
            expect(okStr).toBe("Number is 12");

            const errAsyncStr = errAsync<number, string>("failed");
            const errorStr = await errAsyncStr.caseOf({
                ok: n => `Number is ${n}`,
                err: e => `something wrong happened: ${e}`,
            });
            expect(errorStr).toBe("something wrong happened: failed");
        });
    });

    describe("namespace functions", () => {
        it("map", async () => {
            const mapToLength = ResultAsync.map<string, unknown, number>(str => str.length);

            await expectOkAsync(mapToLength(okAsync("yo")), 2);
            await expectErrAsync(mapToLength(errAsync("my error")), "my error");
        });

        it("flatMap", async () => {
            const mapToLength = ResultAsync.flatMap<string, string, number, "string is too short">(
                (str): Result<number, "string is too short"> =>
                    str.length > 2 ? ok(str.length) : err("string is too short"),
            );

            await expectOkAsync(mapToLength(okAsync("yolo")), 4);
            await expectErrAsync(mapToLength(okAsync("yo")), "string is too short");
            await expectErrAsync(mapToLength(errAsync("my error")), "my error");
        });

        it("caseOf", async () => {
            const handleCases = ResultAsync.caseOf<number, string, string>({
                ok: n => `Number is ${n}`,
                err: e => `something wrong happened: ${e}`,
            });

            const okAsyncStr = okAsync<number, string>(12);
            expect(await handleCases(okAsyncStr)).toBe("Number is 12");

            const errAsyncStr = errAsync<number, string>("failed");
            expect(await handleCases(errAsyncStr)).toBe("something wrong happened: failed");
        });
    });
});
