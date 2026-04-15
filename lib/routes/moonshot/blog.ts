import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://platform.moonshot.ai';
const targetUrl = `${baseUrl}/blog`;

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/moonshot/blog',
    name: 'Blog',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['platform.moonshot.ai/blog'],
            target: '/blog',
        },
    ],
    url: 'platform.moonshot.ai/blog',
};

async function handler() {
    const response = await ofetch(targetUrl);
    const $ = load(response);

    const list: DataItem[] = $('a[href^="/blog/posts/"]')
        .toArray()
        .map((element) => {
            const $element = $(element);
            return {
                title: $element.text().trim().replaceAll(/\s+/g, ' '),
                link: new URL($element.attr('href') ?? '', baseUrl).href,
            };
        })
        .filter((item, index, items) => item.title && item.link && items.findIndex((other) => other.link === item.link) === index)
        .slice(0, 20);

    const item = await pMap(
        list,
        (entry) =>
            cache.tryGet(entry.link!, async () => {
                const detail = await ofetch(entry.link!);
                const $$ = load(detail);
                const article = $$('article').first();
                const meta = article.text().replaceAll(/\s+/g, ' ');
                const dateMatch = meta.match(/Posted on (\d{4}-\d{2}-\d{2})/);
                entry.title = article.find('h1').first().text().trim() || entry.title;
                entry.pubDate = dateMatch ? parseDate(dateMatch[1]) : undefined;
                entry.description = article.html() ?? undefined;
                return entry;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Moonshot AI Blogs',
        description: 'Moonshot AI blog posts',
        link: targetUrl,
        item,
    };
}
