import { register, DiagLogLevel } from "../src/index";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { CompressionAlgorithm } from "@opentelemetry/otlp-exporter-base";

jest.mock("@opentelemetry/sdk-node");
jest.mock("@opentelemetry/instrumentation-http");
jest.mock("@opentelemetry/instrumentation-express");
jest.mock("@opentelemetry/instrumentation-mongodb");
jest.mock("@opentelemetry/exporter-trace-otlp-grpc");

describe("register function", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
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
        traceExporter: expect.any(OTLPTraceExporter),
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
        traceExporter: expect.any(OTLPTraceExporter),
      }),
    );
  });

  it("should use environment variables when config values are not provided", () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://env-endpoint:4317";
    process.env.OTEL_EXPORTER_OTLP_COMPRESSION = "gzip";
    const config = {
      instruments: ["http"],
    };
    register(config);
    expect(OTLPTraceExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://env-endpoint:4317",
        compression: CompressionAlgorithm.GZIP,
      }),
    );
  });

  it("should use config values over environment variables", () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://env-endpoint:4317";
    const config = {
      endpoint: "http://config-endpoint:4317",
      instruments: ["http"],
      compression: CompressionAlgorithm.NONE,
    };
    register(config);
    expect(OTLPTraceExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://config-endpoint:4317",
        compression: undefined,
      }),
    );
  });

  it("should throw an error if invalid endpoint protocol is provided", () => {
    const config = {
      endpoint: "ftp://invalid-endpoint",
      instruments: ["http"],
    };
    expect(() => register(config)).toThrow(
      "Invalid endpoint protocol. Must be http or https.",
    );
  });

  it("should use default endpoint if none is provided", () => {
    const config = {
      instruments: ["http"],
    };
    register(config);
    expect(OTLPTraceExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://localhost:4317",
      }),
    );
  });

  it("should set log level", () => {
    const config = {
      instruments: ["http"],
      logLevel: DiagLogLevel.DEBUG,
    };
    register(config);
    // You might need to mock and test the diag.setLogger function if you want to verify this
  });
});
