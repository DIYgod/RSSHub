import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://bfl.ai';

const fetchDescription = (item: DataItem): Promise<DataItem> =>
    cache.tryGet(item.link!, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const content = $('article .bfl-editorial-stack, article div[class*="lg:max-w-[720px]"]').first();
        content.find('script, style').remove();
        const intro = $('article header .bfl-editorial__body > p:not([class*="meta"])')
            .toArray()
            .map((element) => $.html(element))
            .join('');
        const metadata = $('article > script[type="application/ld+json"]').first().text();
        const authors = metadata ? JSON.parse(metadata).author : undefined;

        return {
            ...item,
            author: authors?.map((author) => author.name).join(', ') || item.author,
            description: content.length ? `${intro}${content.html()}` : item.description,
        };
    });

async function handler(): Promise<Data> {
    const listPageUrl = `${rootUrl}/blog`;
    const response = await ofetch(listPageUrl);
    const $ = load(response);
    const items = $('a[href^="/blog/"]:has(article)')
        .toArray()
        .map((element): DataItem => {
            const $anchor = $(element);
            const datetime = $anchor.find('time').attr('datetime');
            return {
                title: $anchor.find('h2').text(),
                link: new URL($anchor.attr('href')!, rootUrl).href,
                pubDate: datetime ? parseDate(datetime) : undefined,
                description: $anchor.find('p').html(),
                category: $anchor
                    .find('ul li span')
                    .toArray()
                    .map((tag) => $(tag).text()),
                author: 'Black Forest Labs',
            };
        });

    return {
        title: $('head title').text() || 'BFL AI Announcements',
        link: listPageUrl,
        description: $('head meta[name="description"]').attr('content'),
        item: await Promise.all(items.map((item) => fetchDescription(item))),
        language: 'en',
    };
}

export const route: Route = {
    path: '/announcements',
    categories: ['multimedia'],
    example: '/bfl/announcements',
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
            source: ['bfl.ai/blog', 'bfl.ai/announcements'],
            target: '/announcements',
            title: 'Announcements',
        },
    ],
    name: 'Announcements',
    maintainers: ['thirteenkai'],
    handler,
    url: 'bfl.ai/blog',
    description: 'Fetches the latest announcements from Black Forest Labs (bfl.ai). Provides full article content by default with caching.',
};
