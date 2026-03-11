import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://claude.com';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/claude/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['claude.com/blog'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['zhenlong-huang'],
    handler,
    url: 'claude.com/blog',
};

async function handler(ctx) {
    const link = `${baseUrl}/blog`;
    const response = await ofetch(link);
    const $ = load(response);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const list: DataItem[] = $('.blog_cms_list article.card_blog_list_wrap')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const title = $el.find('.card_blog_list_title').text().trim();
            const href = $el.find('a.clickable_link').attr('href') ?? '';
            const pubDateText = $el.find('[fs-list-fieldtype="date"][fs-list-field="date"]').text().trim();
            const category = $el
                .find('[fs-list-field="category"]')
                .toArray()
                .map((c) => $(c).text().trim())
                .filter(Boolean);

            return {
                title,
                link: href.startsWith('http') ? href : `${baseUrl}${href}`,
                pubDate: pubDateText ? parseDate(pubDateText) : undefined,
                category,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('.blog_post_content_wrap');

                content.find('style, script').remove();

                item.description = content.html() ?? undefined;

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Claude Blog',
        link,
        description: 'Product news and best practices for teams building with Claude.',
        language: 'en',
        item: items,
    };
}
