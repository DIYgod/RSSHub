import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { got } from 'got';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/en/features',
    categories: ['university'],
    example: '/shisu/en/features',
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
            source: ['en.shisu.edu.cn/resources/features/'],
        },
    ],
    name: 'FEATURED STORIES',
    maintainers: ['Duuckjing'],
    description: 'Read a series of in-depth stories about SISU faculty, students, alumni and beyond campus.',
    handler: async () => {
        const url = 'https://en.shisu.edu.cn';
        const { body: r } = await got(`${url}/resources/features/`, { https: { rejectUnauthorized: false } });
        // eslint-disable-next-line no-console
        const $ = load(r);
        const itemsoup = $('.tab-con:nth-child(1) ul li')
            .toArray()
            .map((i0) => {
                const i = $(i0);
                const img = i.find('img').attr('src');
                const link = `${url}${i.find('h3>a').attr('href')}`;
                return {
                    title: i.find('h3>a').text().trim(),
                    link,
                    pubDate: parseDate(i.find('p.time').text()),
                    itunes_item_image: `${url}${img}`,
                };
            });
        const items = await Promise.all(
            itemsoup.map((j) =>
                cache.tryGet(j.link, async () => {
                    const { body: r } = await got(j.link, { https: { rejectUnauthorized: false } });
                    const $ = load(r);
                    j.description = $('.details-con').html()!;
                    return j;
                })
            )
        );
        return {
            title: 'FEATURED STORIES',
            link: `${url}/resources/features/`,
            item: items,
        };
    },
};
