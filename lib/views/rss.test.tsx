import { renderToString } from 'hono/jsx/dom/server';
import Parser from 'rss-parser';
import { describe, expect, it } from 'vitest';

import RSS from '@/views/rss';

describe('RSS view', () => {
    it.each([
        ['https://example.com/image.jpg', 'image/jpeg'],
        ['https://example.com/image.jpeg', 'image/jpeg'],
        ['https://example.com/image.png', 'image/png'],
        ['https://example.com/image.webp', 'image/webp'],
        ['https://example.com/image.gif', 'image/gif'],
        ['https://example.com/image.svg', 'image/svg+xml'],
        ['https://example.com/image.PNG?size=300#preview', 'image/png'],
        ['//example.com/image.gif', 'image/gif'],
    ])('renders the image MIME type for %s', (image, mimeType) => {
        const html = renderToString(<RSS data={{ title: 'Feed', item: [{ title: 'Image', image }] }} />);

        expect(html).toContain(`<enclosure url="${image}" type="${mimeType}"`);
    });

    it.each(['https://example.com/image', 'https://example.com/image?filename=image.jpg', 'https://example.com/image.unknown', 'https://example.com/page.html', 'https://example.com/video.mp4', 'https://['])(
        'does not invent a MIME type for %s',
        (image) => {
            const html = renderToString(<RSS data={{ title: 'Feed', item: [{ title: 'Image', image }] }} />);

            expect(html).toContain(`<enclosure url="${image}"></enclosure>`);
        }
    );

    it.each(['audio/mpeg', 'audio/mp4', 'video/mp4'])('preserves the explicit %s enclosure for RSS consumers', async (mimeType) => {
        const html = renderToString(
            <RSS
                data={{
                    title: 'Feed',
                    item: [
                        {
                            title: 'Media',
                            image: 'https://example.com/thumbnail',
                            enclosure_url: 'https://example.com/download?id=media',
                            enclosure_length: 123,
                            enclosure_type: mimeType,
                        },
                    ],
                }}
            />
        );

        expect(html).toContain(`<enclosure url="https://example.com/download?id=media" length="123" type="${mimeType}"`);
        const feed = await new Parser().parseString(html);
        expect(feed.items[0].enclosure).toEqual({ url: 'https://example.com/download?id=media', length: '123', type: mimeType });
        expect(html.match(/<enclosure /g)).toHaveLength(1);
    });

    it('renders itunes, media, and telegram image variants', () => {
        const html = renderToString(
            <RSS
                data={{
                    title: 'RSS Feed',
                    link: 'https://t.me/s/rsshub',
                    atomlink: 'https://example.com/feed.xml',
                    description: 'RSS Description',
                    language: 'en',
                    lastBuildDate: '2024-01-01T00:00:00Z',
                    ttl: 60,
                    itunes_author: 'Podcast Author',
                    itunes_category: 'Tech',
                    itunes_explicit: 'true',
                    image: 'https://example.com/image.jpg',
                    item: [
                        {
                            title: 'Episode One',
                            link: 'https://example.com/one',
                            description: 'Episode One',
                            guid: 'episode-1',
                            pubDate: '2024-01-01T00:00:00Z',
                            author: 'Host',
                            image: 'https://example.com/episode.jpg',
                            itunes_item_image: 'https://example.com/itunes.jpg',
                            itunes_duration: '01:02:03',
                            enclosure_url: 'https://example.com/audio.mp3',
                            enclosure_length: 123,
                            enclosure_type: 'audio/mpeg',
                            category: 'Podcast',
                            media: {
                                content: {
                                    url: 'https://example.com/media.mp4',
                                },
                            },
                        },
                        {
                            title: 'Episode Two',
                            link: 'https://example.com/two',
                            description: 'Episode Two',
                            category: ['News', 'Updates'],
                        },
                    ],
                }}
            />
        );

        expect(html).toContain('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"');
        expect(html).toContain('xmlns:media="http://search.yahoo.com/mrss/"');
        expect(html).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
        expect(html).toContain('<dc:creator>Host</dc:creator>');
        expect(html).not.toContain('<author>');
        expect(html).toContain('<itunes:author>Podcast Author</itunes:author>');
        expect(html).toContain('itunes:category text="Tech"');
        expect(html).toContain('<itunes:explicit>true</itunes:explicit>');
        expect(html).toContain('<height>31</height>');
        expect(html).toContain('<width>88</width>');
        expect(html).toContain('media:content');
        expect(html).toContain('<itunes:image href="https://example.com/itunes.jpg"');
        expect(html).toContain('<enclosure url="https://example.com/audio.mp3"');
        expect(html).toContain('<category>Podcast</category>');
        expect(html).toContain('<category>News</category>');
    });
});
