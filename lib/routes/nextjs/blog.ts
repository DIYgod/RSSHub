import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

const handler: Route['handler'] = async () => {
    const data = await ofetch('https://nextjs.org/blog');

    const $ = load(data);

    const item = await Promise.all(
        $('article')
            .toArray()
            .slice(0, 20)
            .map<Promise<DataItem>>(async (item) => {
                const $ = load(item);

                const h = $('a[href^="/blog"]');
                const title = h.text().trim();
                const link = `https://nextjs.org${h.attr('href')}`;
                const date = $('p').first().text(); // not reliable, but works for now

                const data = (await cache.tryGet(`nextjs:blog:${link}`, () => ofetch(link))) as string;

                return {
                    title,
                    link,
                    description: load(data)('div.prose').html() ?? '',
                    pubDate: parseDate(date.replace(/st|nd|rd|th/, '')),
                };
            })
    );

    return {
        title: 'Next.js Blog',
        link: 'https://nextjs.org/blog',
        language: 'en-US',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Next.js Blog',
    categories: ['blog'],
    maintainers: ['equt'],
    example: '/nextjs/blog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
