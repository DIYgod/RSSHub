import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function getPublicationDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

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
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['zj1123581321'],
    handler,
    url: 'www.humanlayer.dev/blog',
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.humanlayer.dev';
    const listUrl = `${baseUrl}/blog`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const list = $('a.block.py-2.group[href^="/blog/"]')
        .toArray()
        .map((el): DataItem & { link: string } => {
            const $el = $(el);
            const href = $el.attr('href')!;
            const title = $el.find('h2').text();
            const metaLine = $el.find('p.text-sm').text();
            const description = $el.find('p[style]').text();

            // meta format: "Author · Date · Read time · #tag1 #tag2"
            const parts = metaLine.split('·').map((s) => s.trim());
            const author = parts[0] || '';
            const dateStr = parts[1] || '';
            const category = parts[3]?.match(/#[\w-]+/g)?.map((t) => t.slice(1));

            return {
                title,
                link: `${baseUrl}${href}`,
                author,
                description,
                pubDate: getPublicationDate(dateStr),
                category,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`${item.link}:detail`, async (): Promise<Partial<DataItem>> => {
                const resp = await ofetch(item.link);
                const $detail = load(resp);

                const ogTitle = $detail('meta[property="og:title"]').attr('content');
                const ogDesc = $detail('meta[property="og:description"]').attr('content');
                const publishedTime = $detail('meta[property="article:published_time"]').attr('content');
                const ogAuthor = $detail('meta[property="article:author"]').attr('content');
                const ogImage = $detail('meta[property="og:image"]').attr('content');

                const content = $detail('div.prose').html();

                return {
                    title: ogTitle,
                    description: content || ogDesc,
                    pubDate: getPublicationDate(publishedTime),
                    author: ogAuthor,
                    banner: ogImage,
                };
            });
            return {
                ...item,
                title: detail.title || item.title,
                description: detail.description || item.description,
                pubDate: detail.pubDate || item.pubDate,
                author: detail.author || item.author,
                banner: detail.banner,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: 'HumanLayer Blog',
        link: listUrl,
        language: 'en',
        item: items,
    };
}
