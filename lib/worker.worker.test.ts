// Worker environment integration tests using wrangler's unstable_dev
// These tests run the Worker in a simulated Cloudflare Workers environment using Miniflare under the hood
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Unstable_DevWorker } from 'wrangler';
import { unstable_dev } from 'wrangler';

describe('Worker Integration Tests', () => {
    let worker: Unstable_DevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('./dist-worker/worker.mjs', {
            experimental: { disableExperimentalWarning: true },
            local: true,
            config: './wrangler.toml',
        });
    }, 120000);

    afterAll(async () => {
        await worker?.stop();
    });

    describe('Basic Routes', () => {
        it('should respond to /test/1 with valid RSS', async () => {
            const response = await worker.fetch('/test/1');
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toContain('<?xml');
            expect(text).toContain('<rss');
            expect(text).toContain('Test 1');
        }, 120000);

        it('should respond to / with welcome page', async () => {
            const response = await worker.fetch('/');
            expect(response.status).toBe(200);
        }, 120000);

        it('should return error for unknown routes', async () => {
            const response = await worker.fetch('/nonexistent/route/12345');
            expect(response.status).toBeGreaterThanOrEqual(400);
        }, 30000);
    });

    describe('Test Route Variations', () => {
        it('should handle /test/filter route', async () => {
            const response = await worker.fetch('/test/filter');
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toContain('Filter Title');
        }, 30000);

        it('should handle /test/json route', async () => {
            const response = await worker.fetch('/test/json');
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toContain('Title0');
        }, 30000);

        it('should handle /test/cache route', async () => {
            const response = await worker.fetch('/test/cache');
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toContain('Cache Title');
        }, 30000);
    });

    describe('Error Handling', () => {
        it('should handle /test/error route', async () => {
            const response = await worker.fetch('/test/error');
            expect(response.status).toBeGreaterThanOrEqual(400);
        }, 30000);

        it('should handle /test/httperror route', async () => {
            const response = await worker.fetch('/test/httperror');
            expect(response.status).toBeGreaterThanOrEqual(400);
        }, 30000);
    });
});
