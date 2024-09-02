import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { CompressionAlgorithm } from "@opentelemetry/otlp-exporter-base";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";

interface RegisterConfig {
  serviceName?: string;
  endpoint?: string;
  instruments: string[];
  logLevel?: DiagLogLevel;
  compression?: "gzip" | "none";
  exporter?: "otlp";
  customAttributes?: Record<string, string>;
  enableMetrics?: boolean; // Optional flag to enable metrics collection
}

export function register(config: RegisterConfig): void {
  const logLevel = config.logLevel || DiagLogLevel.ERROR;
  diag.setLogger(new DiagConsoleLogger(), logLevel);

  try {
    // Determine the service name from the config or environment variable
    const serviceName =
      config.serviceName || process.env.OTEL_SERVICE_NAME || "unknown-service";
    if (!config.serviceName && !process.env.OTEL_SERVICE_NAME) {
      diag.warn(
        'Service name not provided in config or OTEL_SERVICE_NAME environment variable. Using "unknown-service".',
      );
    }

    // Determine the OTLP endpoint from the config or environment variable
    const endpoint =
      config.endpoint ||
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://localhost:4317";
    const compressionInput =
      config.compression || process.env.OTEL_EXPORTER_OTLP_COMPRESSION;
    const exporter =
      config.exporter || (process.env.OTEL_LOGS_EXPORTER as "otlp" | undefined);

    // Validate endpoint URL to ensure it has a proper protocol
    const url = new URL(endpoint);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid endpoint protocol. Must be http or https.");
    }

    // Set up instrumentations based on the config
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

    // Handle compression settings
    let compression: CompressionAlgorithm | undefined;
    if (compressionInput === "gzip") {
      compression = CompressionAlgorithm.GZIP;
    } else if (compressionInput === "none") {
      compression = undefined;
    }

    // Set up the OTLP trace exporter with the provided endpoint and compression settings
    const traceExporter = new OTLPTraceExporter({
      url: endpoint,
      compression: compression,
    });

    // Create a resource that includes the service name and any custom attributes
    const resource = new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
      ...config.customAttributes,
    });

    // Initialize the OpenTelemetry Node SDK with the configured resource, trace exporter, and instrumentations
    const sdk = new NodeSDK({
      resource: resource,
      traceExporter,
      instrumentations,
    });

    // Optionally enable metrics collection if the enableMetrics flag is set
    if (config.enableMetrics) {
      const metricExporter = new OTLPMetricExporter({
        url: endpoint,
        compression: compression,
      });

      const meterProvider = new MeterProvider({
        resource,
        readers: [
          new PeriodicExportingMetricReader({
            exporter: metricExporter,
            exportIntervalMillis: 1000, // Export metrics every second
          }),
        ],
      });

      // Register the meter provider globally so it can be accessed throughout the application
      require("@opentelemetry/api").metrics.setGlobalMeterProvider(
        meterProvider,
      );

      diag.info("Metrics collection enabled");
    }

    // Start the SDK, which begins collecting and exporting trace data (and metrics if enabled)
    sdk.start();
    diag.info(
      `OpenTelemetry SDK started successfully for service: ${serviceName}`,
    );

    // Gracefully shut down the SDK on process termination (e.g., SIGTERM)
    process.on("SIGTERM", () => {
      sdk
        .shutdown()
        .then(() => diag.info("SDK shut down successfully"))
        .catch((error) => diag.error("Error shutting down SDK", error))
        .finally(() => process.exit(0));
    });
  } catch (error) {
    // Log any errors that occur during SDK initialization
    diag.error("Error in register function:", error);
    throw error;
  }
}

// Export DiagLogLevel so users can easily set the log level
export { DiagLogLevel };
