import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/release/:version?',
    categories: ['programming'],
    example: '/mysql/release/8.0',
    parameters: { version: 'Version, see below, 8.0 by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    handler,
    description: `| 8.0 | 5.7 | 5.6 |
| --- | --- | --- |`,
};

async function handler(ctx) {
    const version = ctx.req.param('version') ?? '8.0';

    const rootUrl = 'https://dev.mysql.com';
    const currentUrl = `${rootUrl}/doc/relnotes/mysql/${version}/en/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            'user-agent': config.trueUA,
        },
    });

    const $ = load(response.data);

    let items = $('dt span a')
        .slice(1, -1)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const title = $item.text();
            const pubDate = title.match(/\((\d{4}-\d{2}-\d{2})(?:,|\))/)?.[1];

            return {
                title,
                pubDate: pubDate ? parseDateInTimezone(pubDate, 0) : undefined,
                link: `${currentUrl}${$item.attr('href')}`,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        'user-agent': config.trueUA,
                    },
                });

                const content = load(detailResponse.data);

                content('.indexterm').remove();
                content('.titlepage').first().remove();
                content('.itemizedlist').first().remove();

                item.description = content('#docs-body .section').html();

                return item;
            }),
        { concurrency: 6 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
