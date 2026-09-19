import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/updates/:category?',
    categories: ['new-media'],
    example: '/maldita/updates/desinfo',
    parameters: { category: 'Category to fetch' },
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
            source: ['maldita.es/:category/'],
            target: '/updates/:category',
        },
    ],
    name: 'Latest Updates',
    maintainers: ['canonnizq'],
    description: 'Categories: all | desinfo | prebunking | investigaciones | control-del-poder | policy',

    handler: async (ctx) => {
        const { category = 'all' } = ctx.req.param();
        const url = `https://maldita.es/${category === 'all' ? '' : `${category}/`}`;

        const response = await ofetch(url);
        const $ = load(response);

        const name = $('h1').text() || 'All updates';

        const links = $(category === 'all' ? 'a.ac-link' : '#content a[href*="maldita.es"]:has(div)')
            .toArray()
            .map((item) => $(item).attr('href')!);

        const items = await Promise.all(
            links.map((link) =>
                cache.tryGet(link, async () => {
                    const response = await ofetch(link);
                    const $ = load(response);

                    return {
                        title: $('h1').text(),
                        link,
                        category: $('#article-metadata .flex a')
                            .toArray()
                            .map((x) => $(x).text()),
                        pubDate: parseDate($('time').attr('datetime')!),
                        itunes_item_image: $('#featuredImage img').attr('src'),
                        content: {
                            html: $('#keys').html()! + $('#article-content').html()!,
                        },
                    };
                })
            )
        );

        return {
            title: `Maldita.es - ${name}`,
            link: url,
            item: items,
        };
    },
};
