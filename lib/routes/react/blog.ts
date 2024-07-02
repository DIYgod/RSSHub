import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

const handler: Route['handler'] = async () => {
    const data = await ofetch('https://react.dev/blog');

    const $ = load(data);

    const item = (await Promise.all(
        $('a[href^="/blog/"]')
            .toArray()
            .slice(0, 20)
            .map((item) => {
                const link = `https://react.dev${item.attribs.href}`;

                return cache.tryGet(`react:blog:${link}`, async () => {
                    const data = await ofetch(link);

                    const $ = load(data);

                    return {
                        title: $('h1').first().text().trim(),
                        link,
                        description: $('article div:nth-child(2)').html() ?? '',
                        pubDate: parseDate($('p.whitespace-pre-wrap').first().text().split(/\s+by/)[0]),
                    };
                });
            })
    )) as DataItem[];

    return {
        title: 'React Blog',
        link: 'https://react.dev/blog',
        language: 'en-US',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
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
