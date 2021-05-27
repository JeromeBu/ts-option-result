import { List } from "../lib/list";

describe("List utils", () => {
    it("find", () => {
        const findNumGreaterThan2 = List.find<number>(n => n >= 2);
        const someNum = findNumGreaterThan2([0, 1, 3, 2]);
        expect(someNum.getOrNull()).toBe(3);

        const noneNum = findNumGreaterThan2([]);
        expect(noneNum.getOrNull()).toBe(null);
    });

    it("first", () => {
        const someNum = List.first([12, 1, 3, 2]);
        expect(someNum.getOrNull()).toBe(12);

        const noneNum = List.first([]);
        expect(noneNum.getOrNull()).toBe(null);
    });

    it("last", () => {
        const someNum = List.last([0, 1, 3, 2]);
        expect(someNum.getOrNull()).toBe(2);

        const noneNum = List.last([]);
        expect(noneNum.getOrNull()).toBe(null);
    });
});
