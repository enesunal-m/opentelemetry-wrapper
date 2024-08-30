# OpenTelemetry Wrapper Package

This package provides a simple wrapper for OpenTelemetry SDKs, making it easy to instrument your Node.js applications with OpenTelemetry.

## Installation

You can install this package using npm:

```bash
npm install infrastack-interview-fs-meu-20240829
```

## Usage

To use this package, import the `register` function and call it with your desired configuration:

```typescript
import { register } from 'infrastack-interview-fs-meu-20240829';

register({
  endpoint: 'http://localhost:4317',
  instruments: ['http', 'express', 'mongodb']
});
```

### Configuration Options

The `register` function accepts a configuration object with the following properties:

- `endpoint` (string): The endpoint where the OpenTelemetry Collector is running. Typically, this will be "http://localhost:4317" for local development.
- `instruments` (string[]): An array of strings representing the instrumentations to be enabled. Supported values are 'http', 'express', and 'mongodb'.

## Supported Instrumentations

This package currently supports the following instrumentations:

- HTTP
- Express
- MongoDB

## Development

### Building the package

To build the package, run:

```bash
npm run build
```

### Running tests

To run the test suite, use:

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
