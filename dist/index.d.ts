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
export declare function register(config: RegisterConfig): void;
export {};
