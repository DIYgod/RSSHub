import { renderToString } from 'hono/jsx/dom/server';
import { describe, expect, it } from 'vitest';

import Atom from '@/views/atom';

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
                            summary: 'Entry One',
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
