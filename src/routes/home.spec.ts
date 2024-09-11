import { homeHandler } from "./home.js";

describe("Route: home", () => {
  it("works", async () => {
    expect(await homeHandler()).toEqual("OK");
  });
});
