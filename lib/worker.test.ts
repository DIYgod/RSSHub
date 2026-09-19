// Worker environment integration tests using wrangler's unstable_dev
// These tests run the Worker in a simulated Cloudflare Workers environment using Miniflare under the hood
import fs from 'node:fs';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Unstable_DevWorker } from 'wrangler';
import { unstable_dev } from 'wrangler';

import type { NamespacesType } from '@/registry';

type JsonFeed = {
    items: Array<{ title: string; content_html: string }>;
};

describe('Worker Integration Tests', () => {
    let worker: Unstable_DevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('./dist-worker/worker.mjs', {
            experimental: { disableExperimentalWarning: true },
            local: true,
            persist: false,
            config: './wrangler.toml',
            vars: { ALLOW_USER_HOTLINK_TEMPLATE: 'true' },
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

    describe('Feed Processing', () => {
        it('should apply common parameters without caching filtered items', async () => {
            const filtered = await worker.fetch('/test/1?format=json&filter_title=^Title2$');
            expect(filtered.status).toBe(200);
            expect(((await filtered.json()) as JsonFeed).items.map((item) => item.title)).toEqual(['Title2']);

            const unfiltered = await worker.fetch('/test/1?format=json');
            expect(unfiltered.status).toBe(200);
            expect(unfiltered.headers.get('RSSHub-Cache-Status')).toBe('HIT');
            expect(((await unfiltered.json()) as JsonFeed).items).toHaveLength(5);

            const limited = await worker.fetch('/test/1?format=json&limit=1');
            expect(limited.status).toBe(200);
            expect(((await limited.json()) as JsonFeed).items).toHaveLength(1);
        });

        it('should normalize and sanitize article HTML', async () => {
            const response = await worker.fetch('/test/complicated?format=json');
            expect(response.status).toBe(200);
            const { items } = (await response.json()) as JsonFeed;
            expect(items[0].content_html).toContain('src="https://mock.com/DIYgod/RSSHub.jpg"');
            expect(items[0].content_html).not.toContain('<script>');
            expect(items[0].content_html).not.toContain('onclick=');
        });

        it('should apply image hotlink templates', async () => {
            const query = new URLSearchParams({
                format: 'json',
                image_hotlink_template: 'https://images.example/${host}${pathname}',
            });
            const response = await worker.fetch(`/test/complicated?${query}`);
            expect(response.status).toBe(200);
            const { items } = (await response.json()) as JsonFeed;
            expect(items[0].content_html).toContain('src="https://images.example/mock.com/DIYgod/RSSHub.jpg"');
        });
    });

    describe('API Routes', () => {
        it('should expose every namespace and route in the regular build', async () => {
            const response = await worker.fetch('/api/namespace');
            expect(response.status).toBe(200);
            const namespaces = (await response.json()) as NamespacesType;
            const expected: NamespacesType = JSON.parse(fs.readFileSync('./assets/build/routes.json', 'utf8'));
            expect(new Set(Object.keys(namespaces))).toEqual(new Set(Object.keys(expected)));
            for (const [namespace, data] of Object.entries(expected)) {
                expect(new Set(Object.keys(namespaces[namespace].routes))).toEqual(new Set(Object.keys(data.routes)));
            }
        });

        it('should expose Radar rules', async () => {
            const response = await worker.fetch('/api/radar/rules/github.com');
            expect(response.status).toBe(200);
            expect(await response.json()).toHaveProperty('_name');
        });

        it('should expose the OpenAPI document', async () => {
            const response = await worker.fetch('/api/openapi.json');
            expect(response.status).toBe(200);
            expect(await response.json()).toHaveProperty(['paths', '/api/namespace']);
        });
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
