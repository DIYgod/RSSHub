import { describe, expect, it } from 'vitest';

import jsonView from '@/views/json';

describe('JSON view', () => {
    it('renders summary, authors, tags, attachments, and extras', () => {
        const jsonOutput = jsonView({
            title: 'JSON Feed',
            link: 'https://example.com',
            feedLink: 'https://example.com/feed.json',
            description: 'JSON Description',
            language: 'en',
            author: 'Feed Author',
            image: 'https://example.com/icon.png',
            item: [
                {
                    title: 'Item One',
                    link: 'https://example.com/one',
                    description: 'Entry One',
                    guid: 'guid-1',
                    content: {
                        html: '<p>hello</p>',
                        text: 'hello',
                    },
                    image: 'https://example.com/image.jpg',
                    banner: 'https://example.com/banner.jpg',
                    pubDate: '2024-01-01T00:00:00Z',
                    updated: '2024-01-02T00:00:00Z',
                    author: 'Item Author',
                    category: ['Tech', 'AI'],
                    enclosure_url: 'https://example.com/audio.mp3',
                    enclosure_type: 'audio/mpeg',
                    enclosure_title: 'Audio Title',
                    enclosure_length: 123,
                    itunes_duration: 321,
                    _extra: { foo: 'bar' },
                },
            ],
        });

        const feed = JSON.parse(jsonOutput);

        expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
        expect(feed.title).toBe('JSON Feed');
        expect(feed.home_page_url).toBe('https://example.com');
        expect(feed.feed_url).toBe('https://example.com/feed.json');
        expect(feed.description).toBe('JSON Description - Powered by RSSHub');
        expect(feed.authors).toEqual([{ name: 'Feed Author' }]);
        expect(feed.items).toHaveLength(1);
        expect(feed.items[0]).toMatchObject({
            id: 'guid-1',
            url: 'https://example.com/one',
            title: 'Item One',
            content_html: '<p>hello</p>',
            content_text: 'hello',
            summary: 'Entry One',
            image: 'https://example.com/image.jpg',
            banner_image: 'https://example.com/banner.jpg',
            date_published: '2024-01-01T00:00:00Z',
            date_modified: '2024-01-02T00:00:00Z',
            authors: [{ name: 'Item Author' }],
            tags: ['Tech', 'AI'],
            attachments: [
                {
                    url: 'https://example.com/audio.mp3',
                    mime_type: 'audio/mpeg',
                    title: 'Audio Title',
                    size_in_bytes: 123,
                    duration_in_seconds: 321,
                },
            ],
        });
        expect(feed.items[0]._extra).toEqual({ foo: 'bar' });
    });
});
