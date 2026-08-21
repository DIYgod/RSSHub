import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

async function handler(ctx) {
    const { category = 'xmxw' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const rootUrl = 'https://news.xmnn.cn';
    const currentUrl = new URL(`${category}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div#sort_body ul li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.find('h1').text().trim(),
                link: $item.prop('href'),
                description: $item.find('div.abstract').html(),
                author: $item.find('div.source').text() as string | string[],
                pubDate: timezone(parseDate($item.find('div.time').text()), 8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.cont-h, div.tip h1').text().trim();
                item.description = content('div.TRS_Editor').html();
                item.author = content('span.cont-a-src a')
                    .toArray()
                    .map((a) => content(a).text());
                item.pubDate = timezone(parseDate(content('span.time, div.pubtime div.w').contents().first().text().trim()), 8);

                return item;
            })
        )
    );

    const title = $('title').text();
    const icon = new URL($('link[rel="icon"]').prop('href')!, rootUrl).href;

    return {
        item: items as DataItem[],
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh' as Language,
        icon,
        logo: icon,
        subtitle: $('div.h').text(),
        author: title.split(/_/).pop(),
    };
}
