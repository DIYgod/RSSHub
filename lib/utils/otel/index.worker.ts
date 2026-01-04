// Worker-specific lightweight otel exports
// Full OpenTelemetry is too heavy for Worker startup
export * from './metric.worker';
export * from './trace.worker';
