import { register } from "../src/index";
import { NodeSDK } from "@opentelemetry/sdk-node";

// Mock the NodeSDK class
jest.mock("@opentelemetry/sdk-node", () => {
  return {
    NodeSDK: jest.fn().mockImplementation(() => {
      return {
        start: jest.fn(), // Mock the start method
      };
    }),
  };
});

describe("register function", () => {
  it("should register HTTP and Express instrumentations", () => {
    const config = {
      endpoint: "http://localhost:4317",
      instruments: ["http", "express"],
    };

    // Call the register function
    register(config);

    // Verify that NodeSDK was called with correct arguments
    expect(NodeSDK).toHaveBeenCalledWith(
      expect.objectContaining({
        instrumentations: expect.arrayContaining([
          expect.anything(), // HttpInstrumentation
          expect.anything(), // ExpressInstrumentation
        ]),
        traceExporter: expect.anything(),
      }),
    );
  });
});
