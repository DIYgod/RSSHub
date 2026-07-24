import { describe, expect, it } from 'vitest';

import { buildSubstackNoteItem, buildSubstackPostItem, getSubstackPostSlug, renderSubstackNote } from './substack';

describe('Substack utilities', () => {
    it('extracts a post slug from a canonical URL', () => {
        expect(getSubstackPostSlug('https://example.substack.com/p/a-paid-post')).toBe('a-paid-post');
        expect(getSubstackPostSlug('https://example.substack.com/archive')).toBeUndefined();
    });

    it('uses the post API body and metadata instead of the feed preview', () => {
        const item = buildSubstackPostItem(
            {
                title: 'Feed title',
                link: 'https://example.substack.com/p/full-post',
                'content:encoded': '<p>Feed preview</p>',
                creator: 'Feed author',
            },
            {
                id: 42,
                title: 'Full post',
                slug: 'full-post',
                canonical_url: 'https://example.substack.com/p/full-post',
                body_html: '<p>Subscriber-visible body</p>',
                post_date: '2026-07-17T12:00:00.000Z',
                publishedBylines: [{ name: 'Author' }],
                postTags: [{ name: 'Markets' }],
                cover_image: 'https://example.com/cover.jpg',
            },
            'example'
        );

        expect(item).toMatchObject({
            title: 'Full post',
            description: '<p>Subscriber-visible body</p>',
            link: 'https://example.substack.com/p/full-post',
            guid: 'https://example.substack.com/p/full-post',
            author: 'Author',
            category: ['Markets'],
            image: 'https://example.com/cover.jpg',
        });
        expect(item.pubDate).toEqual(new Date('2026-07-17T12:00:00.000Z'));
    });

    it('keeps the feed body when post detail is unavailable', () => {
        const item = buildSubstackPostItem(
            {
                title: 'Feed title',
                link: 'https://example.substack.com/p/fallback',
                'content:encoded': '<p>Feed body</p>',
                guid: 'post-42',
            },
            undefined,
            'example'
        );

        expect(item).toMatchObject({
            title: 'Feed title',
            description: '<p>Feed body</p>',
            link: 'https://example.substack.com/p/fallback',
            guid: 'https://example.substack.com/p/fallback',
        });
    });

    it('renders rich Notes content and attachments safely', () => {
        const note = {
            id: 123,
            body: 'A complete note',
            date: '2026-07-16T19:41:28.774Z',
            name: 'Writer',
            handle: 'writer',
            body_json: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            { type: 'text', text: 'Bold & ', marks: [{ type: 'bold' }] },
                            { type: 'text', text: 'linked', marks: [{ type: 'link', attrs: { href: 'https://example.com/read' } }] },
                        ],
                    },
                ],
            },
            attachments: [
                { type: 'image' as const, imageUrl: 'https://example.com/chart.png', imageWidth: 1200, imageHeight: 800 },
                {
                    type: 'link' as const,
                    linkMetadata: {
                        url: 'https://example.com/source',
                        title: 'Source',
                        description: 'Details & context',
                    },
                },
            ],
        };

        const description = renderSubstackNote(note);
        expect(description).toContain('<strong>Bold &amp; </strong>');
        expect(description).toContain('<a href="https://example.com/read">linked</a>');
        expect(description).toContain('<img src="https://example.com/chart.png" width="1200" height="800">');
        expect(description).toContain('<figcaption>Details &amp; context</figcaption>');

        const item = buildSubstackNoteItem(note, { name: 'Writer', handle: 'writer' });
        expect(item).toMatchObject({
            title: 'A complete note',
            link: 'https://substack.com/@writer/note/c-123',
            guid: 'https://substack.com/@writer/note/c-123',
            author: [
                {
                    name: 'Writer',
                    url: 'https://substack.com/@writer',
                },
            ],
        });
        expect(item.pubDate).toEqual(new Date('2026-07-16T19:41:28.774Z'));
    });

    it('escapes a plain-text Note fallback', () => {
        expect(renderSubstackNote({ body: '<script>alert(1)</script>\nsecond line' })).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;<br>second line</p>');
    });

    it('handles attachment-only Notes and rejects unsafe attachment URLs', () => {
        const note = {
            id: 456,
            attachments: [
                { type: 'image' as const, imageUrl: 'https://example.com/chart.heic' },
                { type: 'link' as const, linkMetadata: { url: 'javascript:alert(1)', title: 'Unsafe' } },
            ],
        };

        const item = buildSubstackNoteItem(note, { name: 'Writer', handle: 'writer' });
        expect(item.title).toBe('Note by Writer');
        expect(item.description).toBe('<p><img src="https://example.com/chart.heic"></p>');
    });
});
