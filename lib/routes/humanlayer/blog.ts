import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/humanlayer/blog',
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
            source: ['www.humanlayer.dev/blog'],
            target: '/humanlayer/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['zj1123581321'],
    handler,
    url: 'www.humanlayer.dev/blog',
};

async function handler(ctx) {
    const baseUrl = 'https://www.humanlayer.dev';
    const listUrl = `${baseUrl}/blog`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const list = $('a.block.py-2.group[href^="/blog/"]:not([href^="/blog/tags/"])')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const href = $el.attr('href')!;
            const title = $el.find('h2').text().trim();
            const metaLine = $el.find('p.text-sm').text().trim();
            const description = $el.find('p[style]').text().trim();

            // meta format: "Author · Date · Read time · #tag1 #tag2"
            const parts = metaLine.split('·').map((s) => s.trim());
            const author = parts[0] || '';
            const dateStr = parts[1] || '';
            const category = parts
                .slice(3)
                .join(' ')
                .match(/#\w+/g)
                ?.map((t) => t.slice(1));

            return {
                title,
                link: `${baseUrl}${href}`,
                author,
                description,
                pubDate: dateStr ? parseDate(dateStr) : undefined,
                category,
            } as DataItem;
        });

    const items = (await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const resp = await ofetch(item.link!);
                const $detail = load(resp);

                const ogTitle = $detail('meta[property="og:title"]').attr('content');
                const ogDesc = $detail('meta[property="og:description"]').attr('content');
                const publishedTime = $detail('meta[property="article:published_time"]').attr('content');
                const ogAuthor = $detail('meta[property="article:author"]').attr('content');
                const ogImage = $detail('meta[property="og:image"]').attr('content');

                const content = $detail('div.prose').html();

                return {
                    ...item,
                    title: ogTitle || item.title,
                    description: content || ogDesc || item.description,
                    pubDate: publishedTime ? parseDate(publishedTime) : item.pubDate,
                    author: ogAuthor || item.author,
                    banner: ogImage,
                } as DataItem;
            })
        )
    )) as DataItem[];

    return {
        title: 'HumanLayer Blog',
        link: listUrl,
        language: 'en',
        item: items,
    };
}
