import { NodeSDK } from "@opentelemetry/sdk-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

/**
 * Interface for the configuration object passed to the `register` function.
 */
interface RegisterConfig {
  /**
   * The endpoint where the OpenTelemetry Collector is running.
   * Typically, this will be "localhost:4317" for local development.
   */
  endpoint: string;

  /**
   * Array of strings representing the instrumentations to be enabled.
   * Supported values: 'http', 'express', 'mongodb'
   */
  instruments: string[];
}

/**
 * Registers OpenTelemetry instrumentations and starts the NodeSDK.
 * This function configures the OpenTelemetry SDK with the specified
 * instrumentations and sets up an OTLP trace exporter to send telemetry
 * data to the configured endpoint.
 *
 * @param config - Configuration object for registering the OpenTelemetry SDK.
 *
 * @example
 * ```typescript
 * import { register } from 'infrastack-interview-fs-meu-20240828';
 *
 * register({
 *   endpoint: 'http://localhost:4317',
 *   instruments: ['http', 'express', 'mongodb']
 * });
 * ```
 */
export function register(config: RegisterConfig): void {
  try {
    // Validate config
    if (!config.endpoint) {
      throw new Error("Endpoint is required in the configuration");
    }
    if (!Array.isArray(config.instruments) || config.instruments.length === 0) {
      throw new Error("At least one instrument must be specified");
    }

    // Array to hold the selected instrumentations based on the config
    const instrumentations = [];

    // Add HTTP instrumentation if 'http' is included in the instruments array
    if (config.instruments.includes("http")) {
      instrumentations.push(new HttpInstrumentation());
    }

    // Add Express instrumentation if 'express' is included in the instruments array
    if (config.instruments.includes("express")) {
      instrumentations.push(new ExpressInstrumentation());
    }

    // Add MongoDB instrumentation if 'mongodb' is included in the instruments array
    if (config.instruments.includes("mongodb")) {
      instrumentations.push(new MongoDBInstrumentation());
    }

    // Configure the OTLP trace exporter with the provided endpoint
    const traceExporter = new OTLPTraceExporter({
      url: `${config.endpoint}/v1/traces`,
    });

    // Initialize and start the NodeSDK with the configured trace exporter and instrumentations
    const sdk = new NodeSDK({
      traceExporter,
      instrumentations,
    });

    // Start the OpenTelemetry SDK
    sdk.start();
  } catch (error) {
    console.error("Failed to register OpenTelemetry:", error);
    throw error; // Re-throw to allow caller to handle
  }
}
