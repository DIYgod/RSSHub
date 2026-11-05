import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/blog',
    categories: ['new-media'],
    example: '/macfilos/blog',
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
            source: ['macfilos.com/blog', 'macfilos.com/'],
        },
    ],
    name: 'Blog',
    maintainers: ['nczitzk'],
    handler,
    url: 'macfilos.com/blog',
};

async function handler(ctx) {
    const rootUrl = 'https://www.macfilos.com';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.entry-title a')
        .slice(0, getRouteLimit(ctx, 10))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const parent = $item.parent().parent();

            return {
                title: $item.text(),
                link: $item.attr('href'),
                author: parent.find('.td-post-author-name a').text(),
                pubDate: parseDate(parent.find('.td-post-date time').attr('datetime')!),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const description = await cache.tryGet(`macfilos:article:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const donationHeading = content('.td-post-content h3').filter((_, element) => content(element).text().startsWith('Make a donation'));
                donationHeading.prev('hr').remove();
                donationHeading.nextAll().remove();
                donationHeading.remove();

                content('img').each((_, el) => {
                    content(el).removeAttr('srcset');
                });

                return content('.td-post-content').html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
