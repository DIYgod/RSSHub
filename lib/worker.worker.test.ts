// Worker environment integration tests using Wrangler's unstable_dev
// These tests run the Worker in a simulated Cloudflare environment
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { UnstableDevWorker } from 'wrangler';
import { unstable_dev } from 'wrangler';

describe('Worker Integration Tests', () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('./dist-worker/worker.mjs', {
            experimental: { disableExperimentalWarning: true },
            local: true,
            config: './wrangler.toml',
        });
    }, 60000);

    afterAll(async () => {
        await worker.stop();
    });

    describe('Basic Routes', () => {
        it('should respond to /test/1 route', async () => {
            const response = await worker.fetch('/test/1');
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toContain('<?xml');
            expect(text).toContain('<rss');
        });

        it('should respond to / with welcome page', async () => {
            const response = await worker.fetch('/');
            expect(response.status).toBe(200);
        });

        it('should return error for unknown routes', async () => {
            const response = await worker.fetch('/nonexistent/route/12345');
            // Worker returns 503 for routes that don't match any handler
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('RSS Feed Routes', () => {
        it('should fetch hackernews index', async () => {
            const response = await worker.fetch('/hackernews/index');
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toContain('<?xml');
            expect(text).toContain('Hacker News');
        }, 30000);

        it('should fetch v2ex hot topics', async () => {
            const response = await worker.fetch('/v2ex/topics/hot');
            expect(response.status).toBe(200);
            const text = await response.text();
            expect(text).toContain('<?xml');
            expect(text).toContain('V2EX');
        }, 30000);
    });

    describe('Error Handling', () => {
        it('should handle puppeteer routes gracefully (no browser binding)', async () => {
            // Routes that require puppeteer should fail gracefully when BROWSER binding is not available
            const response = await worker.fetch('/weibo/search/hot');
            // Should return an error page, not crash
            expect(response.status).toBeGreaterThanOrEqual(400);
            const text = await response.text();
            expect(text).toContain('Browser Rendering API not available');
        }, 30000);
    });
});
