import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

interface RegisterConfig {
  endpoint: string;
  instruments: string[];
  logLevel?: DiagLogLevel;
}

export function register(config: RegisterConfig): void {
  // Set up logging based on the provided log level or default to ERROR
  const logLevel = config.logLevel || DiagLogLevel.ERROR;
  diag.setLogger(new DiagConsoleLogger(), logLevel);

  try {
    // Validate endpoint URL
    const url = new URL(config.endpoint);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid endpoint protocol. Must be http or https.");
    }

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

    const traceExporter = new OTLPTraceExporter({
      url: config.endpoint,
    });

    const sdk = new NodeSDK({
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
