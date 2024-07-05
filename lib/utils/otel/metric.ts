import { Resource } from '@opentelemetry/resources';
import { PrometheusExporter, PrometheusSerializer } from '@opentelemetry/exporter-prometheus';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Attributes } from '@opentelemetry/api';

interface IMetricAttributes extends Attributes {
    method: string;
    path: string;
    status: number;
}

interface IHistogramAttributes extends IMetricAttributes {
    unit: string;
}

const METRIC_PREFIX = 'rsshub';

const exporter = new PrometheusExporter({});

const provider = new MeterProvider({
    resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'rsshub',
    }),
    readers: [exporter],
});

const serializer = new PrometheusSerializer();

const meter = provider.getMeter('rsshub');

const requestTotal = meter.createCounter<IMetricAttributes>(`${METRIC_PREFIX}_request_total`);
const requestErrorTotal = meter.createCounter<IMetricAttributes>(`${METRIC_PREFIX}_request_error_total`);
const requestDurationSecondsBucket = meter.createHistogram<IHistogramAttributes>(`${METRIC_PREFIX}_request_duration_seconds_bucket`, {
    advice: {
        explicitBucketBoundaries: [0.01, 0.1, 1, 2, 5, 15, 30, 60],
    },
});
const request_duration_milliseconds_bucket = meter.createHistogram<IHistogramAttributes>(`${METRIC_PREFIX}_request_duration_milliseconds_bucket`, {
    advice: {
        explicitBucketBoundaries: [10, 20, 50, 100, 250, 500, 1000, 5000, 15000],
    },
});

export const requestMetric = {
    success: (value: number, attributes: IMetricAttributes) => {
        requestTotal.add(1, attributes);
        request_duration_milliseconds_bucket.record(value, { unit: 'millisecond', ...attributes });
        requestDurationSecondsBucket.record(value / 1000, { unit: 'second', ...attributes });
    },
    error: (attributes: IMetricAttributes) => {
        requestErrorTotal.add(1, attributes);
    },
};

export const getContext = () =>
    new Promise<string>((resolve, reject) => {
        exporter
            .collect()
            .then((value) => {
                resolve(serializer.serialize(value.resourceMetrics));
            })
            .finally(() => {
                reject('');
            });
    });
