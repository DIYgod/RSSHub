import { renderToString } from 'hono/jsx/dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Atom as RenderAtom, json as renderJson, RSS as RenderRSS, rss3 as renderRss3 } from '@/utils/render';
import Atom from '@/views/atom';
import jsonView from '@/views/json';
import RSS from '@/views/rss';
import rss3View from '@/views/rss3';

afterEach(() => {
    vi.resetModules();
    vi.unmock('@/config');
    vi.unmock('@/utils/debug-info');
    vi.unmock('@/utils/git-hash');
});

describe('view exports', () => {
    it('re-exports view helpers from render', () => {
        expect(RenderAtom).toBe(Atom);
        expect(RenderRSS).toBe(RSS);
        expect(renderJson).toBe(jsonView);
        expect(renderRss3).toBe(rss3View);
    });
});

describe('Atom view', () => {
    it('renders optional fields and media extensions', () => {
        const html = renderToString(
            <Atom
                data={{
                    title: 'Atom Feed',
                    link: 'https://example.com',
                    description: 'Atom Description',
                    language: 'zh',
                    lastBuildDate: '2024-01-01T00:00:00Z',
                    icon: 'https://example.com/icon.png',
                    logo: 'https://example.com/logo.png',
                    item: [
                        {
                            title: 'Item One',
                            link: 'https://example.com/one',
                            description: 'Entry One',
                            pubDate: '2024-01-01T00:00:00Z',
                            updated: '2024-01-02T00:00:00Z',
                            author: 'Author One',
                            category: 'News',
                            media: {
                                content: {
                                    url: 'https://example.com/video.mp4',
                                },
                            },
                            upvotes: 12,
                            downvotes: 1,
                            comments: 3,
                        },
                        {
                            title: 'Item Two',
                            link: 'https://example.com/two',
                            description: 'Entry Two',
                            category: ['Tech', 'AI'],
                            guid: 'guid-2',
                        },
                    ],
                }}
            />
        );

        expect(html).toContain('<icon>https://example.com/icon.png</icon>');
        expect(html).toContain('<logo>https://example.com/logo.png</logo>');
        expect(html).toContain('media:content');
        expect(html).toContain('term="News"');
        expect(html).toContain('term="Tech"');
        expect(html).toContain('rsshub:upvotes');
        expect(html).toContain('rsshub:downvotes');
        expect(html).toContain('rsshub:comments');
    });
});

describe('RSS view', () => {
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
                            enclosure_length: '123',
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

describe('Index view', () => {
    const renderIndex = async (debugInfo: string | undefined, debugQuery: string | undefined) => {
        const debugData = {
            hitCache: 2,
            request: 10,
            etag: 3,
            error: 1,
            routes: {
                '/foo': 5,
                '/bar': 2,
            },
            paths: {
                '/foo?x=1': 4,
                '/bar?x=2': 1,
            },
            errorRoutes: {
                '/error': 2,
                '/fail': 1,
            },
            errorPaths: {
                '/error?x=1': 1,
                '/fail?x=2': 1,
            },
        };

        vi.doMock('@/config', () => ({
            config: {
                debugInfo,
                disallowRobot: true,
                nodeName: 'TestNode',
                cache: {
                    routeExpire: 120,
                },
            },
        }));
        vi.doMock('@/utils/debug-info', () => ({
            getDebugInfo: () => debugData,
        }));
        vi.doMock('@/utils/git-hash', () => ({
            gitHash: 'abc123',
            gitDate: new Date('2020-01-01T00:00:00Z'),
        }));

        const { default: Index } = await import('@/views/index');

        return renderToString(<Index debugQuery={debugQuery} />);
    };

    it('shows debug info when enabled', async () => {
        const html = await renderIndex('secret', 'secret');

        expect(html).toContain('Debug Info');
        expect(html).toContain('TestNode');
        expect(html).toContain('abc123');
        expect(html).toContain('5 /foo');
        expect(html).toContain('2 /error');
    });

    it('hides debug info when disabled', async () => {
        const html = await renderIndex('false', 'secret');

        expect(html).not.toContain('Debug Info');
    });
});
