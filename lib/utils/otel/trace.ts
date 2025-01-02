import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const provider = new BasicTracerProvider({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'rsshub',
    }),
});

const exporter = new OTLPTraceExporter({
    // optional OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318
});

provider.addSpanProcessor(
    new BatchSpanProcessor(exporter, {
        // The maximum queue size. After the size is reached spans are dropped.
        maxQueueSize: 4096,
        // The interval between two consecutive exports
        scheduledDelayMillis: 30000,
    })
);

provider.register();

export const tracer = provider.getTracer('rsshub');
export const mainSpan = tracer.startSpan('main');
