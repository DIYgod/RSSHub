import { load } from 'cheerio';
import pMap from 'p-map';

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

function parsePublicationDate(value?: string) {
    const text = value?.trim();
    if (!text) {
        return;
    }
    const date = parseDate(text, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD'], true);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

async function fetchArticleDetail(link: string): Promise<Pick<DataItem, 'title' | 'description' | 'author' | 'pubDate'>> {
    const { data: detailResponse } = await got(link);
    const content = load(detailResponse);
    return {
        title: content('div.cont-h, div.tip h1').text(),
        description: content('div.TRS_Editor').html(),
        author: content('span.cont-a-src a')
            .toArray()
            .map((a) => ({ name: content(a).text() })),
        pubDate: parsePublicationDate(content('span.time, div.pubtime div.w').text()),
    };
}

async function handler(ctx) {
    const { category = 'xmxw' } = ctx.req.param();
    const parsedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
    const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 30;

    const rootUrl = 'https://news.xmnn.cn';
    const currentUrl = `${rootUrl}/${category}/`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const list = $('div#sort_body ul li a')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const sourceAuthor = $item.find('div.source').text().trim();

            return {
                title: $item.find('h1').text(),
                link: $item.prop('href')!,
                description: $item.find('div.abstract').html(),
                author: sourceAuthor ? [{ name: sourceAuthor }] : undefined,
                pubDate: parsePublicationDate($item.find('div.time').text()),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`xmnn:article:${item.link}`, () => fetchArticleDetail(item.link));
            return {
                ...item,
                title: item.title || detail.title,
                description: detail.description ?? item.description,
                author: item.author ?? detail.author,
                pubDate: item.pubDate ?? detail.pubDate,
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
