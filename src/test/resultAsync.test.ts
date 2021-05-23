import { errAsync, ok, okAsync, ResultAsync } from "..";
import { expectErrAsync, expectOkAsync } from "./helpers";

describe("ResultAsync", () => {
    describe("methods", () => {
        it("construct okAsync and errAsync", async () => {
            await expectOkAsync(okAsync(12), 12);
            await expectErrAsync(errAsync("failed"), "failed");
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
    });
    describe("namespace functions", () => {
        it("fromPromise", async () => {
            const resolveStr = Promise.resolve("myStr");
            const okAsyncStr = ResultAsync.fromPromise(resolveStr);
            await expectOkAsync(okAsyncStr, "myStr");

            const rejectStr: Promise<string> = Promise.reject("failure");
            const errAsyncStr = ResultAsync.fromPromise(rejectStr);
            await expectErrAsync(errAsyncStr, "failure");

            const rejectStr2: Promise<string> = Promise.reject("failure");
            const errAsyncStr2 = ResultAsync.fromPromise(rejectStr2, e => "error was " + e);
            await expectErrAsync(errAsyncStr2, "error was failure");
        });
    });
});
