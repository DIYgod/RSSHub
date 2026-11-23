import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/news/:category{.+}?',
    categories: ['traditional-media'],
    example: '/xmnn/news/xmxw',
    parameters: { category: '分类 id，见下表，默认为厦门新闻' },
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
            source: ['news.xmnn.cn/:category'],
            target: '/news/:category',
        },
        {
            source: ['www.xmnn.cn/news/:category/*path'],
            target: '/news/:category',
        },
        {
            source: ['news.xmnn.cn/:category/*path'],
            target: '/news/:category',
        },
    ],
    name: '新闻',
    maintainers: ['nczitzk'],
    handler,
    description: `| 分类名       | 分类 id |
| ------------ | ------- |
| 厦门新闻发布 | xmxwfb  |
| 厦门新闻     | xmxw    |
| 本网快报     | bwkb    |
| 厦门网眼     | xmwy    |
| 福建新闻     | fjxw    |
| 国内新闻     | gnxw    |
| 国际新闻     | gjxw    |
| 台海新闻     | thxw    |
| 社会新闻     | shxw    |`,
};

async function fetchArticleDetail(link: string) {
    const { data: detailResponse } = await got(link);
    const content = load(detailResponse);
    return content('div.TRS_Editor').html();
}

async function handler(ctx) {
    const { category = 'xmxw' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://news.xmnn.cn';
    const currentUrl = `${rootUrl}/${category}/`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const list = $('div#sort_body ul li a')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.find('h1').text(),
                link: new URL($item.prop('href')!, currentUrl).href,
                description: $item.find('div.abstract').html(),
                author: [{ name: $item.find('div.source').text().trim() }],
                pubDate: parseDate($item.find('div.time').text().trim(), 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`xmnn:article:${item.link}`, () => fetchArticleDetail(item.link));
            return {
                ...item,
                description: description ?? item.description,
            };
        },
        { concurrency: 3 }
    );

    const title = $('title').text();
    const icon = new URL($('link[rel="icon"]').prop('href')!, rootUrl).href;

    const language: Language = 'zh';

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language,
        icon,
        logo: icon,
        subtitle: $('div.h').text(),
        author: title.split(/_/).pop(),
    };
}
