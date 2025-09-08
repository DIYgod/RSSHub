import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

const handler: Route['handler'] = async () => {
    const data = await ofetch('https://nextjs.org/blog');

    const $ = load(data);

    const item = (await Promise.all(
        $('article')
            .toArray()
            .slice(0, 20)
            .map((item) => {
                const $ = load(item);
                const link = `https://nextjs.org${$('a[href^="/blog"]').attr('href')}`;

                return cache.tryGet(`nextjs:blog:${link}`, async () => {
                    const data = await ofetch(link);

                    const $ = load(data);

                    return {
                        title: $('h1').first().text().trim(),
                        link,
                        description: $('div.prose').html() ?? '',
                        pubDate: parseDate(
                            $('p[data-version="v1"]')
                                .first()
                                .text()
                                .replace(/st|nd|rd|th/, '')
                        ),
                    };
                });
            })
    )) as DataItem[];

    return {
        title: 'Next.js Blog',
        link: 'https://nextjs.org/blog',
        language: 'en-US',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    categories: ['program-update'],
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
