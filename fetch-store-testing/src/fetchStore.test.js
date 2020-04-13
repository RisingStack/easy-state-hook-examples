import fetchStore from "./fetchStore";

describe("fetchStore", () => {
  const TEST_URL = "https://test.com/";
  let fetchMock;

  beforeAll(() => {
    fetchMock = jest
      .spyOn(global, "fetch")
      .mockReturnValue(Promise.resolve({ json: () => "Some data" }));
  });
  afterAll(() => {
    fetchMock.mockRestore();
  });

  test("should fetch the required resource", async () => {
    const resource = fetchStore(TEST_URL);

    expect(resource.loading).toBe(undefined);
    expect(resource.data).toBe(undefined);

    const fetchPromise = resource.fetch("resource");
    expect(resource.loading).toBe(true);
    expect(fetchMock).toBeCalledWith("https://test.com/resource");
    await fetchPromise;
    expect(resource.loading).toBe(false);
    expect(resource.data).toBe("Some data");
  });
});
