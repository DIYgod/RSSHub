import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

const handler: Route['handler'] = async () => {
    const item = (await cache.tryGet('nextjs:blog', async () => {
        const data = await ofetch('https://nextjs.org/blog');

        const $ = load(data);

        return await Promise.all(
            $('article')
                .toArray()
                .slice(0, 1)
                .map<Promise<DataItem>>(async (item) => {
                    const $ = load(item);

                    const h = $('a[href^="/blog"]');
                    const title = h.text().trim();
                    const link = `https://nextjs.org${h.attr('href')}`;
                    const date = $('p').first().text(); // not reliable, but works for now

                    const data = await ofetch(link);

                    return {
                        title,
                        link,
                        description: load(data)('div.prose').html() ?? '',
                        pubDate: parseDate(date.replace(/st|nd|rd|th/, '')),
                    };
                })
        );
    })) as DataItem[];

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
