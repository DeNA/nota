import { validateJSON, prettifyJSON, trimJSON } from "./jsonUtils";

describe("validateJSON", () => {
  it("should return true when valid json is passed", async () => {
    const json = `{"foo": 1}`;
    const response = await validateJSON(json);

    expect(response).toBe(true);
  });

  it("should return Error object when invalid json is passed", async () => {
    const json = `{foo": 1}`;
    const response = await validateJSON(json);

    expect(response).toBeInstanceOf(Error);
  });
});

describe("prettifyJSON", () => {
  it("should return empty string when a passing something falsy", async () => {
    const json = "";
    const response = await prettifyJSON(json);

    expect(response).toEqual("");
  });

  it("should return 2 space prettyfied json", async () => {
    const json = `{"foo":1}`;
    const expected = `{\n  "foo": 1\n}`;
    const response = await prettifyJSON(json);

    expect(response).toEqual(expected);
  });
});

describe("trimJSON", () => {
  it("should return empty string when a passing something falsy", async () => {
    const json = "";
    const response = await trimJSON(json);

    expect(response).toEqual("");
  });

  it("should return 2 space prettyfied json", async () => {
    const json = `{\n  "foo": 1\n}`;
    const expected = `{"foo":1}`;
    const response = await trimJSON(json);

    expect(response).toEqual(expected);
  });
});
