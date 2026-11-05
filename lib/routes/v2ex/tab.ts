import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/tab/:tabid',
    categories: ['bbs'],
    view: ViewType.Articles,
    example: '/v2ex/tab/hot',
    parameters: { tabid: 'tab标签ID,在 URL 可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '标签',
    maintainers: ['liyefox'],
    handler,
};

async function handler(ctx) {
    const tabid = ctx.req.param('tabid');
    const host = 'https://v2ex.com';
    const pageUrl = `${host}/?tab=${tabid}`;

    const response = await got({
        method: 'get',
        url: pageUrl,
        headers: {
            'user-agent': config.ua,
        },
    });

    const $ = load(response.data);
    const limit = getRouteLimit(ctx, 10);
    const list = $('span.item_title > a')
        .toArray()
        .slice(0, limit)
        .map((link) => ({
            title: $(link).text(),
            link: `${host}${$(link).attr('href')!.replace(/#.*$/, '')}`,
            category: $(link)
                .closest('.cell')
                .find('a.node')
                .toArray()
                .map((node) => $(node).text())
                .filter(Boolean),
        }));

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'author' | 'pubDate'>>(`v2ex:tab:article-details:v3:${item.link}`, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        'user-agent': config.ua,
                    },
                });

                const $ = load(response.data);

                return {
                    description: $('div.topic_content').html() ?? undefined,
                    author: $('div.header > small > a').text(),
                    pubDate: parsePublicationDate($('.header small span[title]').attr('title')),
                };
            });

            return {
                ...item,
                description: details.description,
                author: details.author,
                pubDate: details.pubDate,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `V2EX-${tabid}`,
        link: pageUrl,
        description: `V2EX-tab-${tabid}`,
        item: items,
    };
}

function parsePublicationDate(value?: string) {
    const match = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ([+-]\d{2}:\d{2})$/.exec(value ?? '');
    if (!match || !Number.isFinite(parseDate(match[1], 'YYYY-MM-DD HH:mm:ss', true).getTime())) {
        return;
    }

    const date = parseDate(match[1].replace(' ', 'T') + match[2]);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
