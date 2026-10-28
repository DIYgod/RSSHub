import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/dailynews',
    categories: ['traditional-media'],
    example: '/pts/dailynews',
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
            source: ['news.pts.org.tw/dailynews', 'news.pts.org.tw/'],
        },
    ],
    name: '即時新聞',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.pts.org.tw/dailynews',
};

export async function handler(ctx) {
    const requestedLimit = Number(ctx.req.query('limit'));
    // oxlint-disable-next-line unicorn-js/prefer-number-is-safe-integer -- Preserve the existing positive-integer limit acceptance range and default.
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 30;
    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}${getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const articleLinks = $('h1 a,h2 a');
    const list = articleLinks.length ? articleLinks : $('a[href*="/article/"]:has(h2), a[href*="/article/"].font-bold').filter((_, element) => $(element).text().trim() !== '閱讀更多文章');

    let items = list
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.find('h2').length ? $item.find('h2').text() : $item.text(),
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        })
        .filter((item, index, list) => list.findIndex((other) => other.link === item.link) === index)
        .slice(0, limit);

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const author = content('.reporter-container a')
                    .toArray()
                    .map((e) => ({ name: content(e).text() }));
                const published = content('.article-time .mr-2 time').text();
                const modified = content('.article-time span:nth-child(2) time').text();
                const pubDate = published ? timezone(parseDate(published), 8) : undefined;
                const updated = modified ? timezone(parseDate(modified), 8) : undefined;
                const category = content('.tag-list')
                    .first()
                    .find('.blue-tag')
                    .toArray()
                    .map((t) => content(t).text())
                    .filter((t) => t !== '...');
                const description = renderDescription({
                    image: content('meta[property="og:image"]').attr('content'),
                    description: content('.post-article').html() ?? undefined,
                });
                return { author, pubDate, updated, category, description };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title')
            .text()
            .replace(/第\d+頁 ｜ /, ''),
        link: currentUrl,
        item: items,
    };
}
