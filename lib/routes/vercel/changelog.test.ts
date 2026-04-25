import Parser from 'rss-parser';
import { describe, expect, it, vi } from 'vitest';

import app from '@/app';
import ofetch from '@/utils/ofetch';

const parser = new Parser();

const mockChangelogHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Changelog - Vercel</title>
</head>
<body>
  <script>
    self.__next_f.push([1, '1:["$","abc123",null,{"children":["abc123"]}]']);
    self.__next_f.push([1, '2:["$L1",[["$","abc123",null,{"slug":"test-changelog-1","title":"Test Changelog Entry 1","publishedAt":"2026-04-23T07:00:00.000Z"}]]]']);
    self.__next_f.push([1, '3:["$L2",[["$","abc123",null,{"slug":"test-changelog-2","title":"Test Changelog Entry 2","publishedAt":"2026-04-22T07:00:00.000Z"}]]]']);
    self.__next_f.push([1, '4:["$L3",[["$","abc123",null,{"slug":"blog/test-blog-1","title":"Test Blog Entry","publishedAt":"2026-04-21T07:00:00.000Z"}]]]']);
  </script>
  <div>
    <h2>Test Changelog Entry 1</h2>
    <time>Apr 23, 2026</time>
    <p>This is a test changelog entry 1.</p>
  </div>
  <div>
    <h2>Test Changelog Entry 2</h2>
    <time>Apr 22, 2026</time>
    <p>This is a test changelog entry 2.</p>
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
  <script>
    self.__next_f.push([1, '1:["$","abc123",null,{"children":["abc123"]}]']);
    self.__next_f.push([1, '2:["$L1",[["$","abc123",null,{"content":[{"type":"p","children":["This is the detailed content."]}]}]]]']);
  </script>
</body>
</html>
`;

vi.mock('@/utils/ofetch', () => ({
    default: vi.fn((url) => {
        if (url === 'https://vercel.com/changelog') {
            return Promise.resolve(mockChangelogHtml);
        }
        if (url.startsWith('https://vercel.com/changelog/')) {
            return Promise.resolve(mockDetailHtml);
        }
        return Promise.resolve('');
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
});
