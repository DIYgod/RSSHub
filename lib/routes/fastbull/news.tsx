import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/fastbull/news',
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
            source: ['fastbull.com/cn/news', 'fastbull.com/cn'],
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    url: 'fastbull.com/news',
};

async function handler() {
    const rootUrl = 'https://www.fastbull.com';
    const currentUrl = `${rootUrl}/cn/news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const seenLinks = new Set<string>();
    let items = $('.trending_type')
        .toArray()
        .filter((item) => {
            const link = $(item).attr('href')!;
            if (seenLinks.has(link)) {
                return false;
            }
            seenLinks.add(link);
            return true;
        })
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.find('.title').text(),
                link: `${rootUrl}${$item.attr('href')}`,
                author: $item.find('.resource').text(),
                description: $item.find('.tips').text(),
                pubDate: parseDate(Number.parseInt($item.find('.new_time').attr('data-date')!)),
            };
        });
    const candidates = items;
    items = await pMap(
        candidates,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const detailHtml = content('.news-detail-content').html();
                item.description = renderToString(
                    <>
                        {item.description ? (
                            <>
                                <b>摘要</b>：<p>{item.description}</p>
                            </>
                        ) : null}
                        {detailHtml ? raw(detailHtml) : null}
                    </>
                );

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '财经头条、财经新闻、最新资讯 - FastBull',
        link: currentUrl,
        item: items,
    };
}
