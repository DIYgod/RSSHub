import { describe, expect, it } from 'vitest';

import { buildBilibiliArticleFeedItem, parseBilibiliArticlePage } from './bilibili-article';

describe('buildBilibiliArticleFeedItem', () => {
    it('does not publish an authenticated title-only fallback', () => {
        const item = buildBilibiliArticleFeedItem({
            article: {
                title: 'Subscriber article',
            },
            fallbackTitle: 'Subscriber article',
            link: 'https://www.bilibili.com/opus/123',
            authenticated: true,
        });

        expect(item).toBeUndefined();
    });

    it('marks an authenticated full-text upgrade with a distinct stable guid', () => {
        const item = buildBilibiliArticleFeedItem({
            article: {
                title: 'Subscriber article',
                description: '<p>Full subscriber body</p>',
            },
            fallbackTitle: 'Subscriber article',
            link: 'https://www.bilibili.com/opus/123',
            authenticated: true,
        });

        expect(item).toMatchObject({
            guid: 'https://www.bilibili.com/opus/123#rsshub-authenticated-fulltext-v1',
            description: '<p>Full subscriber body</p>',
        });
    });

    it('retains the title preview for anonymous feeds', () => {
        const item = buildBilibiliArticleFeedItem({
            article: {},
            fallbackTitle: 'Public preview',
            link: 'https://www.bilibili.com/opus/123',
            authenticated: false,
        });

        expect(item).toMatchObject({
            guid: 'https://www.bilibili.com/opus/123',
            description: 'Public preview',
        });
    });
});

describe('parseBilibiliArticlePage', () => {
    it('extracts the complete opus body and metadata', () => {
        const article = parseBilibiliArticlePage(`
            <html>
                <head><title>Fallback title - 哔哩哔哩</title></head>
                <body>
                    <div class="opus-module-title__text">Full article title</div>
                    <div class="opus-module-author__name">Capital_12</div>
                    <div class="opus-module-author__pub__text">编辑于 2026年07月17日 16:38</div>
                    <div class="opus-module-content"><h2>Heading</h2><p>Subscriber-visible body</p></div>
                    <div class="opus-module-paywall">Paywall prompt</div>
                </body>
            </html>
        `);

        expect(article).toEqual({
            title: 'Full article title',
            description: '<h2>Heading</h2><p>Subscriber-visible body</p>',
            author: 'Capital_12',
            pubDate: '2026年07月17日 16:38',
        });
    });

    it('falls back to the document title when the opus title is unavailable', () => {
        const article = parseBilibiliArticlePage('<html><head><title>Fallback title - 哔哩哔哩</title></head><body></body></html>');

        expect(article.title).toBe('Fallback title');
        expect(article.description).toBeUndefined();
    });

    it('ignores Bilibili verification pages', () => {
        const article = parseBilibiliArticlePage('<html><head><title>验证码_哔哩哔哩</title></head><body></body></html>');

        expect(article).toEqual({});
    });
});
