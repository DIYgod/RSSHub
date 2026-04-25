import Parser from 'rss-parser';
import type { Page } from 'rebrowser-puppeteer';
import { describe, expect, it, vi } from 'vitest';

import app from '@/app';

const parser = new Parser();

const mockChangelogHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Changelog - Vercel</title>
</head>
<body>
  <div role="main">
    <div role="listitem">
      <a href="/changelog/test-changelog-1">Test Changelog Entry 1</a>
      <span>Apr 23, 2026</span>
      <p>This is a test changelog entry 1.</p>
    </div>
    <div role="listitem">
      <a href="/changelog/test-changelog-2">Test Changelog Entry 2</a>
      <span>Apr 22, 2026</span>
      <p>This is a test changelog entry 2.</p>
    </div>
    <div role="listitem">
      <a href="/blog/test-blog-1">Test Blog Entry</a>
      <span>Apr 21, 2026</span>
      <p>This is a blog entry, should be filtered out.</p>
    </div>
  </div>
</body>
</html>
`;

const mockDetailHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Entry - Vercel</title>
</head>
<body>
  <main role="main">
    <h1>Test Changelog Entry 1</h1>
    <span>Apr 23, 2026</span>
    <p>This is the detailed content for test changelog entry 1.</p>
    <p>It contains more information about the changes.</p>
  </main>
</body>
</html>
`;

const mockDetailHtml2 = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Entry 2 - Vercel</title>
</head>
<body>
  <main role="main">
    <h1>Test Changelog Entry 2</h1>
    <span>Apr 22, 2026</span>
    <p>This is the detailed content for test changelog entry 2.</p>
  </main>
</body>
</html>
`;

vi.mock('@/utils/puppeteer', () => ({
    getPuppeteerPage: vi.fn((url: string) => {
        let html = '';
        if (url === 'https://vercel.com/changelog') {
            html = mockChangelogHtml;
        } else if (url.includes('/changelog/test-changelog-1')) {
            html = mockDetailHtml;
        } else if (url.includes('/changelog/test-changelog-2')) {
            html = mockDetailHtml2;
        }

        const mockPage: Partial<Page> = {
            waitForSelector: vi.fn().mockResolvedValue(null),
            content: vi.fn().mockResolvedValue(html),
            goto: vi.fn().mockResolvedValue(null),
        };

        return Promise.resolve({
            page: mockPage as Page,
            destroy: vi.fn().mockResolvedValue(null),
            browser: {
                close: vi.fn().mockResolvedValue(null),
            },
        });
    }),
}));

describe('vercel/changelog route', () => {
    it('should return valid RSS feed with correct structure', async () => {
        const response = await app.request('/vercel/changelog');
        expect(response.status).toBe(200);

        const text = await response.text();
        const feed = await parser.parseString(text);

        expect(feed.title).toBe('Vercel Changelog');
        expect(feed.link).toBe('https://vercel.com/changelog');
        expect(feed.items).toEqual(expect.any(Array));

        for (const item of feed.items) {
            expect(item.title).toBeDefined();
            expect(item.link).toBeDefined();
            expect(item.guid).toBeDefined();
        }
    });

    it('should have unique guids for all items', async () => {
        const response = await app.request('/vercel/changelog');
        expect(response.status).toBe(200);

        const text = await response.text();
        const feed = await parser.parseString(text);

        const guids = feed.items.map((item) => item.guid);
        const uniqueGuids = new Set(guids);
        expect(uniqueGuids.size).toBe(guids.length);
    });

    it('should only include changelog entries (not blog entries)', async () => {
        const response = await app.request('/vercel/changelog');
        expect(response.status).toBe(200);

        const text = await response.text();
        const feed = await parser.parseString(text);

        const titles = feed.items.map((item) => item.title);
        expect(titles).toContain('Test Changelog Entry 1');
        expect(titles).toContain('Test Changelog Entry 2');
        expect(titles).not.toContain('Test Blog Entry');
    });
});
