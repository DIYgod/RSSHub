import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

const handler: Route['handler'] = async () => {
    const item = (await cache.tryGet('react:blog', async () => {
        const data = await ofetch('https://react.dev/blog');

        const $ = load(data);

        return await Promise.all(
            $('a[href^="/blog/"]')
                .toArray()
                .slice(0, 20)
                .map<Promise<DataItem>>(async (item) => {
                    const $ = load(item);

                    const title = $('h2').text();
                    const link = `https://react.dev${item.attribs.href}`;
                    const date = $('div > div:nth-child(2) > div:nth-child(1)').text(); // not reliable, but works for now

                    const data = await ofetch(link);

                    return {
                        title,
                        link,
                        description: load(data)('article div:nth-child(2)').html() ?? '',
                        pubDate: parseDate(date),
                    };
                })
        );
    })) as DataItem[];

    return {
        title: 'React Blog',
        link: 'https://react.dev/blog',
        language: 'en-US',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'React Blog',
    categories: ['blog'],
    maintainers: ['equt'],
    example: '/react/blog',
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
