import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import Parser from 'rss-parser';
import app from '@/app';
import server from '@/setup.test';

const parser = new Parser();

const mockAtomFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Vercel News</title>
  <subtitle>Blog</subtitle>
  <link href="https://vercel.com/atom" rel="self" type="application/rss+xml"/>
  <link href="https://vercel.com/"/>
  <updated>2026-04-24T07:51:43.248Z</updated>
  <id>https://vercel.com/</id>
  
  <entry>
    <id>https://vercel.com/changelog/test-changelog-1</id>
    <title>Test Changelog Entry 1</title>
    <link href="https://vercel.com/changelog/test-changelog-1"/>
    <updated>2026-04-23T07:00:00.000Z</updated>
    <content type="xhtml">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <p>This is a test changelog entry 1.</p>
        <p class="more">
          <a href="https://vercel.com/changelog/test-changelog-1">Read more</a>
        </p>
      </div>
    </content>
    <author><name>Test Author</name></author>
  </entry>
  
  <entry>
    <id>https://vercel.com/changelog/test-changelog-2</id>
    <title>Test Changelog Entry 2</title>
    <link href="https://vercel.com/changelog/test-changelog-2"/>
    <updated>2026-04-22T07:00:00.000Z</updated>
    <content type="xhtml">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <p>This is a test changelog entry 2.</p>
      </div>
    </content>
    <author><name>Another Author</name></author>
  </entry>
  
  <entry>
    <id>https://vercel.com/blog/test-blog-entry</id>
    <title>Test Blog Entry (Should Be Filtered Out)</title>
    <link href="https://vercel.com/blog/test-blog-entry"/>
    <updated>2026-04-21T07:00:00.000Z</updated>
    <content type="xhtml">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <p>This is a blog entry, should be filtered out.</p>
      </div>
    </content>
    <author><name>Blog Author</name></author>
  </entry>
</feed>`;

server.use(
    http.get('https://vercel.com/atom', () => HttpResponse.text(mockAtomFeed))
);

describe('vercel/changelog route', () => {
    it('should return valid RSS feed with changelog entries only', async () => {
        const response = await app.request('/vercel/changelog');
        expect(response.status).toBe(200);

        const text = await response.text();
        const feed = await parser.parseString(text);

        expect(feed.title).toBe('Vercel Changelog');
        expect(feed.link).toBe('https://vercel.com/changelog');
        expect(feed.items).toEqual(expect.any(Array));
        expect(feed.items.length).toBe(2);

        const changelogTitles = feed.items.map((item) => item.title);
        expect(changelogTitles).toContain('Test Changelog Entry 1');
        expect(changelogTitles).toContain('Test Changelog Entry 2');
        expect(changelogTitles).not.toContain('Test Blog Entry (Should Be Filtered Out)');

        const item1 = feed.items.find((item) => item.title === 'Test Changelog Entry 1');
        expect(item1?.link).toBe('https://vercel.com/changelog/test-changelog-1');
        expect(item1?.pubDate).toBeDefined();
        expect(item1?.content).toContain('This is a test changelog entry 1');
    });

    it('should filter out non-changelog entries', async () => {
        const response = await app.request('/vercel/changelog');
        expect(response.status).toBe(200);

        const text = await response.text();
        const feed = await parser.parseString(text);

        const blogLinks = feed.items.filter((item) => item.link?.includes('/blog/'));
        expect(blogLinks.length).toBe(0);

        const changelogLinks = feed.items.filter((item) => item.link?.startsWith('https://vercel.com/changelog/'));
        expect(changelogLinks.length).toBe(feed.items.length);
    });
});
