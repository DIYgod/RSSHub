import { describe, expect, it } from 'vitest';

import { formatFeed, htmlToText } from './feed';

describe('magpie feed', () => {
    it('turns HTML into text', () => {
        expect(htmlToText('<p>Hello <b>world</b></p><p>a&amp;b &#20013;&#x6587;<br>next</p><img alt="cat" src="x"><script>alert(1)</script>')).toBe('Hello world\na&b 中文\nnext\n[image: cat]');
    });

    it('formats a JSON Feed for an agent', () => {
        const text = formatFeed(
            {
                title: 'Example',
                home_page_url: 'https://example.com',
                description: 'Example - Powered by RSSHub',
                items: [
                    {
                        title: 'First',
                        url: 'https://example.com/1',
                        content_html: '<p>Some long content here</p>',
                        date_published: '2026-11-03T00:00:00.000Z',
                        authors: [{ name: 'Ann' }],
                        tags: ['news'],
                        attachments: [{ url: 'https://example.com/1.mp3', mime_type: 'audio/mpeg' }],
                    },
                    { title: 'Second', url: 'https://example.com/2' },
                ],
            },
            'http://127.0.0.1:1200/example',
            9
        );
        expect(text).toBe(
            [
                '# Example',
                'Website: https://example.com',
                'Feed URL: http://127.0.0.1:1200/example',
                '',
                '2 items:',
                '',
                '1. First',
                '   https://example.com/1',
                '   2026-11-03T00:00:00.000Z · Ann · #news',
                '   attachment: https://example.com/1.mp3 (audio/mpeg)',
                '   Some long…',
                '',
                '2. Second',
                '   https://example.com/2',
            ].join('\n')
        );
    });

    it('leaves the text out when asked for none', () => {
        expect(formatFeed({ items: [{ title: 'A', content_html: 'body' }] }, 'http://x/a', 0)).not.toContain('body');
    });
});
