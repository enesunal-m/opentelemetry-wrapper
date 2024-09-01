import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { CompressionAlgorithm } from "@opentelemetry/otlp-exporter-base";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

interface RegisterConfig {
  serviceName: string;
  endpoint?: string;
  instruments: string[];
  logLevel?: DiagLogLevel;
  compression?: "gzip" | "none";
  exporter?: "otlp";
  customAttributes?: Record<string, string>;
}

export function register(config: RegisterConfig): void {
  const logLevel = config.logLevel || DiagLogLevel.ERROR;
  diag.setLogger(new DiagConsoleLogger(), logLevel);

  try {
    const endpoint =
      config.endpoint ||
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://localhost:4317";
    const compressionInput =
      config.compression || process.env.OTEL_EXPORTER_OTLP_COMPRESSION;
    const exporter =
      config.exporter || (process.env.OTEL_LOGS_EXPORTER as "otlp" | undefined);

    // Validate endpoint URL
    const url = new URL(endpoint);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid endpoint protocol. Must be http or https.");
    }

    // Set up instrumentations
    const instrumentations = [];
    if (config.instruments.includes("http")) {
      instrumentations.push(new HttpInstrumentation());
    }
    if (config.instruments.includes("express")) {
      instrumentations.push(new ExpressInstrumentation());
    }
    if (config.instruments.includes("mongodb")) {
      instrumentations.push(new MongoDBInstrumentation());
    }

    // Handle compression
    let compression: CompressionAlgorithm | undefined;
    if (compressionInput === "gzip") {
      compression = CompressionAlgorithm.GZIP;
    } else if (compressionInput === "none") {
      compression = undefined;
    }

    // Set up exporter
    const traceExporter = new OTLPTraceExporter({
      url: endpoint,
      compression: compression,
    });

    // Create resource with service name and custom attributes
    const resource = new Resource({
      [ATTR_SERVICE_NAME]: config.serviceName,
      ...config.customAttributes,
    });

    // Initialize SDK
    const sdk = new NodeSDK({
      resource: resource,
      traceExporter,
      instrumentations,
    });

    // Start the SDK
    sdk.start();
    diag.info("OpenTelemetry SDK started successfully");

    // Handle process shutdown
    process.on("SIGTERM", () => {
      sdk
        .shutdown()
        .then(() => diag.info("SDK shut down successfully"))
        .catch((error) => diag.error("Error shutting down SDK", error))
        .finally(() => process.exit(0));
    });
  } catch (error) {
    diag.error("Error in register function:", error);
    throw error;
  }
}

// Export DiagLogLevel so users can easily set the log level
export { DiagLogLevel };
