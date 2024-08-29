import { register } from "../src/index";

describe("register function", () => {
  it("should register HTTP and Express instrumentations", () => {
    const config = {
      endpoint: "http://localhost:4317",
      instruments: ["http", "express"],
    };

    // Mock or spy on SDK initialization
    const sdkStartSpy = jest.spyOn(
      require("@opentelemetry/sdk-node"),
      "NodeSDK",
    );

    register(config);

    // Verify that NodeSDK was initialized with correct instrumentations
    expect(sdkStartSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        instrumentations: expect.arrayContaining([
          expect.anything(), // HttpInstrumentation
          expect.anything(), // ExpressInstrumentation
        ]),
      }),
    );

    sdkStartSpy.mockRestore();
  });
});
