"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const instrumentation_mongodb_1 = require("@opentelemetry/instrumentation-mongodb");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
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
function register(config) {
    // Array to hold the selected instrumentations based on the config
    const instrumentations = [];
    // Add HTTP instrumentation if 'http' is included in the instruments array
    if (config.instruments.includes("http")) {
        instrumentations.push(new instrumentation_http_1.HttpInstrumentation());
    }
    // Add Express instrumentation if 'express' is included in the instruments array
    if (config.instruments.includes("express")) {
        instrumentations.push(new instrumentation_express_1.ExpressInstrumentation());
    }
    // Add MongoDB instrumentation if 'mongodb' is included in the instruments array
    if (config.instruments.includes("mongodb")) {
        instrumentations.push(new instrumentation_mongodb_1.MongoDBInstrumentation());
    }
    // Configure the OTLP trace exporter with the provided endpoint
    const traceExporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({
        url: `${config.endpoint}/v1/traces`,
    });
    // Initialize and start the NodeSDK with the configured trace exporter and instrumentations
    const sdk = new sdk_node_1.NodeSDK({
        traceExporter,
        instrumentations,
    });
    // Start the OpenTelemetry SDK
    sdk.start();
}
