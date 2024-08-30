import { register } from "../src/index";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";

jest.mock("@opentelemetry/sdk-node");
jest.mock("@opentelemetry/instrumentation-http");
jest.mock("@opentelemetry/instrumentation-express");
jest.mock("@opentelemetry/instrumentation-mongodb");

describe("register function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register HTTP and Express instrumentations", () => {
    const config = {
      endpoint: "http://localhost:4317",
      instruments: ["http", "express"],
    };
    register(config);
    expect(NodeSDK).toHaveBeenCalledWith(
      expect.objectContaining({
        instrumentations: expect.arrayContaining([
          expect.any(HttpInstrumentation),
          expect.any(ExpressInstrumentation),
        ]),
        traceExporter: expect.anything(),
      }),
    );
  });

  it("should register all instrumentations when specified", () => {
    const config = {
      endpoint: "http://localhost:4317",
      instruments: ["http", "express", "mongodb"],
    };
    register(config);
    expect(NodeSDK).toHaveBeenCalledWith(
      expect.objectContaining({
        instrumentations: expect.arrayContaining([
          expect.any(HttpInstrumentation),
          expect.any(ExpressInstrumentation),
          expect.any(MongoDBInstrumentation),
        ]),
        traceExporter: expect.anything(),
      }),
    );
  });

  it("should throw an error if no endpoint is provided", () => {
    const config = {
      endpoint: "",
      instruments: ["http"],
    };
    expect(() => register(config)).toThrow(
      "Endpoint is required in the configuration",
    );
  });

  it("should throw an error if no instruments are specified", () => {
    const config = {
      endpoint: "http://localhost:4317",
      instruments: [],
    };
    expect(() => register(config)).toThrow(
      "At least one instrument must be specified",
    );
  });
});
