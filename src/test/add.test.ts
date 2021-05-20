import { add } from "../add";

describe("sandbox test", () => {
    it("adds 2 numbers", () => {
        expect(add(2, 3)).toBe(5);
    });
});
