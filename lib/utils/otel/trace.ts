import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const exporter = new OTLPTraceExporter({
    // optional OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318
});

const provider = new BasicTracerProvider({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'rsshub',
    }),
    spanProcessors: [
        new BatchSpanProcessor(exporter, {
            // The maximum queue size. After the size is reached spans are dropped.
            maxQueueSize: 4096,
            // The interval between two consecutive exports
            scheduledDelayMillis: 30000,
        }),
    ],
});

trace.setGlobalTracerProvider(provider);

export const tracer = provider.getTracer('rsshub');
export const mainSpan = tracer.startSpan('main');
