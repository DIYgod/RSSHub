import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

const handler: Route['handler'] = async () => {
    const data = await ofetch('https://smallstep.com/blog');

    const $ = load(data);

    const item = (await Promise.all(
        $('article')
            .toArray()
            // .slice(0, 20)
            .map((item) => {
                const $ = load(item);
                const link = `https://smallstep.com${$('a[href^="/blog"]').attr('href')}`;
                const description = $('p').first().text().trim();
                const author = $('span').first().text().trim().replace(/By /, '');

                return cache.tryGet(`smallstep:blog:${link}`, async () => {
                    const data = await ofetch(link);

                    const $ = load(data);

                    return {
                        title: $('h1').first().text().trim(),
                        link,
                        author: author ?? '',
                        description: description ?? '',
                        pubDate: parseDate(
                            $('time[datetime="{updatedAt}"]')
                                .first()
                                .text()
                                .replace(/Updated on: /, '')
                        ),
                    };
                });
            })
    )) as DataItem[];

    return {
        title: 'Smallstep Blog',
        link: 'https://smallstep.com/blog',
        language: 'en-US',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    categories: ['blog'],
    maintainers: ['vickunwu'],
    example: '/smallstep/blog',
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
