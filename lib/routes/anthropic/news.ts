import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { DataItem, Route } from '@/types';
import pMap from 'p-map';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/anthropic/news',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/news', 'www.anthropic.com'],
        },
    ],
    name: 'News',
    maintainers: ['etShaw-zh'],
    handler,
    url: 'www.anthropic.com/news',
};

async function handler(ctx) {
    const link = 'https://www.anthropic.com/news';
    const response = await ofetch(link);
    const $ = load(response);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const list: DataItem[] = $('.contentFadeUp a')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const title = $el.find('h3').text().trim();
            const href = $el.attr('href') ?? '';
            const pubDate = $el.find('p.detail-m.agate').text().trim() || $el.find('div[class^="PostList_post-date__"]').text().trim(); // legacy selector used roughly before Jan 2025
            const fullLink = href.startsWith('http') ? href : `https://www.anthropic.com${href}`;
            return {
                title,
                link: fullLink,
                pubDate,
            };
        });

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                $('div[class^="PostDetail_b-social-share"]').remove();

                const content = $('div[class*="PostDetail_post-detail__"]');
                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    const params = new URLSearchParams(src);
                    const newSrc = params.get('/_next/image?url');
                    if (newSrc) {
                        $e.attr('src', newSrc);
                    }
                });

                item.description = content.html() ?? undefined;

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic News',
        link,
        description: 'Latest news from Anthropic',
        item: out,
    };
}
