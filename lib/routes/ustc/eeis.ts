import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const map = new Map([
    ['tzgg', { title: '中国科学技术大学电子工程与信息科学系 - 通知公告', id: '2702' }],
    ['xwxx', { title: '中国科学技术大学电子工程与信息科学系 - 新闻信息', id: '2706' }],
]);
const host = 'https://eeis.ustc.edu.cn';
export const route: Route = {
    path: '/eeis/:type?',
    categories: ['university'],
    example: '/ustc/eeis/tzgg',
    parameters: { type: '分类，见下表，默认为通知公告' },
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
            source: ['eeis.ustc.edu.cn/'],
            target: '/eeis',
        },
    ],
    name: '电子工程与信息科学系',
    maintainers: ['jasongzy'],
    handler,
    url: 'eeis.ustc.edu.cn/',
    description: `| 通知公告 | 新闻信息 |
| -------- | -------- |
| tzgg     | xwxx     |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw new InvalidParameterError('invalid type');
    }
    const id = info.id;
    const response = await got(`${host}/${id}/list.htm`);
    const $ = load(response.data);
    const list = $('div[portletmode=simpleList]')
        .find('div.card, article')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const anchor = $item.find('.card-title > a, h4 > a[title]').first();
            const title = anchor.attr('title') ?? anchor.text();
            let link = anchor.attr('href');
            link = link!.startsWith('/') ? host + link : link;
            const published = $item.find('time').first().text().replace('发布时间：', '').trim();
            const pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined;
            return {
                title,
                pubDate,
                link,
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`ustc:eeis:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author'> = {};
                try {
                    const response = await got(item.link);
                    const desc = load(response.data)('div.wp_articlecontent').html();
                    details.description = desc;
                } catch {
                    // intranet only contents
                }
                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: info.title,
        link: `${host}/${id}/list.htm`,
        item: items,
    };
}
