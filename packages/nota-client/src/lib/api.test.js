import { fetch } from "./api";
import * as auth from "./auth";

auth.token = jest.fn(() => "Bearer foobar");

const jsonHeaders = new Headers();
jsonHeaders.set("Content-type", "application/json");
const imageHeaders = new Headers();
imageHeaders.set("Content-type", "image/foo");
const emptyHeaders = new Headers();
const notSupportedHeaders = new Headers();
notSupportedHeaders.set("Content-type", "foo/bar");

const mockResponse = (status, statusText, response, headers = jsonHeaders) => {
  return new Response(response, {
    status: status,
    statusText: statusText,
    headers
  });
};

const mockFetch = response => {
  window.fetch = jest.fn(() => Promise.resolve(response));
};

describe("fetch", () => {
  it("should work for json", async () => {
    const body = { foo: "bar" };
    mockFetch(mockResponse(200, null, JSON.stringify(body)));

    const response = await fetch();
    expect(response).toEqual(body);
  });

  it("should work for image/", async () => {
    const body = "foobar";
    mockFetch(mockResponse(200, null, body, imageHeaders));

    const response = await fetch();
    expect(response).toEqual("data:image/foo;base64,Zm9vYmFy");
  });

  it("should throw when error and no message", async () => {
    mockFetch(mockResponse(500, null, "{}", emptyHeaders));

    try {
      await fetch();
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error.message).toMatch("Problem with request");
    }
  });

  it("should throw when error and message", async () => {
    const body = { message: "fooerror" };
    mockFetch(mockResponse(500, null, JSON.stringify(body), emptyHeaders));

    try {
      await fetch();
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error.message).toMatch("fooerror");
    }
  });

  it("should return null when notSupportedHeaders", async () => {
    mockFetch(mockResponse(200, null, "", notSupportedHeaders));

    const response = await fetch();
    expect(response).toBeNull();
  });
});
