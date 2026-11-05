import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ee/:id?',
    categories: ['university'],
    example: '/xjtu/ee/1114',
    parameters: { id: '栏目id，默认请求`1124`，可在 URL 中找到' },
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
            source: ['ee.xjtu.edu.cn/'],
        },
    ],
    name: '电气学院',
    maintainers: ['DylanXie123'],
    handler,
    url: 'ee.xjtu.edu.cn/',
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '1124';
    const rootUrl = `http://ee.xjtu.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${id}`;
    const baseUrl = 'http://ee.xjtu.edu.cn';

    const listResponse = await got(rootUrl);
    const $ = load(listResponse.data);

    const feedTitle = $('span.windowstyle67278', "div[class='list_right fr']").text();

    const list = $("div[class='list_right fr'] ul li")
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const dateText = $item.find('span').text();
            const date = dateText.trim() ? parseDate(dateText) : undefined;
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: date && Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined,
            };
        });

    return {
        title: `西安交通大学电气学院 - ${feedTitle}`,
        link: baseUrl,
        item: await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`xjtu:ee:article:v1:${item.link}`, async () => {
                    const res = await got(item.link);
                    const content = load(res.data);
                    return {
                        title: content('tr td[class^=titlestyle]').text(),
                        description: content('td.contentstyle67362', 'form').html(),
                    };
                });
                return { ...item, ...detail };
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
