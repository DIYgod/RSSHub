import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category?',
    categories: ['programming'],
    example: '/hacking8',
    parameters: { category: '分类，见下表，默认为最近更新' },
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
            source: ['hacking8.com/index/:category', 'hacking8.com/'],
        },
    ],
    name: '信息流',
    maintainers: ['nczitzk'],
    handler,
    description: `| 推荐  | 最近更新 | 漏洞 / PoC 监控 | PDF |
| ----- | -------- | --------------- | --- |
| likes | index    | vul-poc         | pdf |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'index';

    const rootUrl = 'https://i.hacking8.com';
    const currentUrl = `${rootUrl}/index/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('div.media')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.link a');

            return {
                title: a.text(),
                link: new URL(a.attr('href'), rootUrl).href,
                description: item.find('div.media-body pre').text(),
                pubDate: timezone(parseDate(item.parent().parent().find('td').first().text(), 'YYYY年M月D日 HH:mm'), +8),
                category: item
                    .parent()
                    .parent()
                    .find('span.label')
                    .toArray()
                    .map((l) => $(l).text()),
            };
        });

    return {
        title: `Hacking8 安全信息流 - ${$('div.btn-group a.btn-primary').text()}`,
        link: currentUrl,
        item: items,
    };
}
