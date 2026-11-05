import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: ['/xhsxw', '/whxw'],
    categories: ['new-media'],
    example: '/news/xhsxw',
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
            source: ['news.cn/xhsxw.htm'],
        },
    ],
    name: '新闻',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.cn/xhsxw.htm',
};

type NewsItem = DataItem & { link: string; description: string };
type Detail = { description?: string };

function parsePublishedTime(value: string | number | null | undefined) {
    if ([undefined, null, ''].includes(value as string | null | undefined)) {
        return;
    }
    const date = parseDate(value!);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 100);

    const rootUrl = 'http://www.news.cn';
    const currentUrl = new URL('xhsxw.htm', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const id = $('ul.wz-list')
        .prop('data')
        .replace(/datasource:/, '');

    const apiUrl = new URL(`ds_${id}.json`, rootUrl).href;

    const {
        data: { datasource: response },
    } = await got(apiUrl);

    let items: NewsItem[] = response.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(item.publishUrl, rootUrl).href,
        description: renderDescription({
            images:
                item.shareImages?.map((i) => ({
                    src: i.imageUrl,
                    alt: item.title,
                })) ?? undefined,
            intro: item.summary,
        }),
        author: item.author,
        category: item.keywords.split(/-|,/),
        guid: `news-${item.contentId}`,
        pubDate: parsePublishedTime(item.publishTime),
    }));

    items = await pMap(
        items,
        async (item) => {
            let detail: Detail = {};
            try {
                detail = await cache.tryGet<Detail>(`news:detail:${item.link}`, async () => {
                    const { data: detailResponse } = await got(item.link);
                    const content = load(detailResponse);
                    return { description: content('#detailContent').html() ?? undefined };
                });
            } catch {
                // Preserve the source summary when the public detail is unavailable.
            }
            return { ...item, description: item.description + renderDescription(detail) };
        },
        { concurrency: 3 }
    );

    const title = $('title').text();
    const image = new URL('20141223_xhsxw_logo_v1.png', rootUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: title.split(/_/, 1)[0],
        language: 'zh' as const satisfies Language,
        image,
        icon,
        logo: icon,
        author: title.split(/_/).pop(),
        allowEmpty: true,
    };
}
