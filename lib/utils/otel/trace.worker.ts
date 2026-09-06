// Worker-specific lightweight trace implementation
// Full OpenTelemetry is too heavy for Worker startup, use no-op implementations
import type { SpanOptions } from '@opentelemetry/api';

interface Span {
    addEvent(name: string): void;
    end(): void;
}

interface Tracer {
    startSpan(name: string, options?: SpanOptions): Span;
}

// No-op span implementation
const noopSpan: Span = {
    addEvent: () => {},
    end: () => {},
};

// No-op tracer implementation
const noopTracer: Tracer = {
    startSpan: () => noopSpan,
};

export const tracer = noopTracer;
export const mainSpan = noopSpan;
