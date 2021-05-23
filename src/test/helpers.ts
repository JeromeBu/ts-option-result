import { Result, ResultAsync } from "..";

export const expectOk = <T, E>(result: Result<T, E>, expectedValue: T) => {
    expect(result.isOk()).toBe(true);
    expect(result.getOrThrow()).toEqual(expectedValue);
};

export const expectErr = <T, E>(result: Result<T, E>, expectedError: E) => {
    expect(result.isErr()).toBe(true);
    expect(() => result.getOrThrow()).toThrowError(expectedError as unknown as string);
};

export const expectOkAsync = async <T, E>(resultAsync: ResultAsync<T, E>, expectedValue: T) => {
    const result = await resultAsync;
    expectOk(result, expectedValue);
};

export const expectErrAsync = async <T, E>(resultAsync: ResultAsync<T, E>, expectedError: E) => {
    const result = await resultAsync;
    expectErr(result, expectedError);
};
