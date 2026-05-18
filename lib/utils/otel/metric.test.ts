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
});
