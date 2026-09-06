// Worker-compatible metrics shim
// OpenTelemetry Prometheus exporter is not available in Workers (requires http.createServer)

interface IMetricAttributes {
    method: string;
    path: string;
    status: number;
}

// No-op metrics for Worker environment
export const requestMetric = {
    success: (_value: number, _attributes: IMetricAttributes) => {
        // No-op in Workers
    },
    error: (_attributes: IMetricAttributes) => {
        // No-op in Workers
    },
};

export const getContext = (): Promise<string> => Promise.resolve('# Metrics not available in Worker environment\n');
