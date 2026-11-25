import net from 'node:net';

import { describe, expect, it } from 'vitest';

import { getContext, requestMetric } from '@/utils/otel/metric';

describe('otel metrics', () => {
    it('serializes prometheus metrics', async () => {
        requestMetric.success(150, {
            method: 'GET',
            path: '/test',
            status: 200,
        });
        requestMetric.error({
            method: 'GET',
            path: '/test',
            status: 500,
        });

        const output = await getContext();

        expect(output).toContain('rsshub_request_total');
        expect(output).toContain('rsshub_request_error_total');
    });

    it('does not open the exporter port', async () => {
        // binding the exporter's default port ourselves only succeeds when the exporter has not taken it
        const probe = net.createServer();
        const outcome = await new Promise((resolve) => {
            probe.once('error', (error: NodeJS.ErrnoException) => resolve(error.code));
            probe.listen(9464, () => probe.close(() => resolve('free')));
        });
        expect(outcome).toBe('free');
    });
});
