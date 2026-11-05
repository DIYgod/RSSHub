import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/apod',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/bjp/apod',
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
            source: ['www.bjp.org.cn/APOD/:id.shtml', 'www.bjp.org.cn/'],
            target: '/apod',
        },
    ],
    name: '每日一图',
    maintainers: ['HenryQW'],
    handler,
    url: 'www.bjp.org.cn/APOD/list.shtml',
};

async function handler(ctx) {
    const baseUrl = 'https://www.bjp.org.cn';
    const listUrl = `${baseUrl}/APOD/list.shtml`;

    const res = await got(listUrl);

    const $ = load(res.data);

    const list = $('td[align=left] b')
        .toArray()
        .map((e): DataItem => {
            const $e = $(e);
            return {
                title: $e.find('a').attr('title')!,
                link: `${baseUrl}${$e.find('a').attr('href')}`,
                pubDate: timezone(parseDate($e.find('span').text().replace('：', ''), 'YYYY-MM-DD'), 8),
            };
        })
        .toSorted((a, b) => Number(b.pubDate) - Number(a.pubDate))
        .slice(0, getRouteLimit(ctx, 10));

    const items = await Promise.all(
        list.map((e) =>
            cache.tryGet(e.link!, async () => {
                const { data } = await got.get(e.link);
                const $ = load(data);

                const content = $('.juzhong');
                content
                    .find('p')
                    .filter((_, paragraph) => $(paragraph).text() === e.title)
                    .remove();
                e.description = content.html();

                return e;
            })
        )
    );
    return {
        title: $('head title').text(),
        description: '探索宇宙！每天发布一张迷人宇宙的影像，以及由专业天文学家撰写的简要说明。',
        link: listUrl,
        item: items,
    };
}
