import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
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
    name: '新华社新闻',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.cn/xhsxw.htm',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

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

    let items = response.slice(0, limit).map((item) => ({
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
        pubDate: timezone(parseDate(item.publishTime), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    item.description += renderDescription({
                        description: content('#detailContent').html(),
                    });
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL('20141223_xhsxw_logo_v1.png', rootUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: title.split(/_/)[0],
        language: 'zh',
        image,
        icon,
        logo: icon,
        author: title.split(/_/).pop(),
        allowEmpty: true,
    };
}
