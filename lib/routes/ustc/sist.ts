import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const map = new Map([
    ['tzgg', { title: '中国科学技术大学信息科学技术学院 - 通知公告', id: '5142' }],
    ['zsgz', { title: '中国科学技术大学信息科学技术学院 - 招生工作', id: '5108' }],
]);

const host = 'https://sist.ustc.edu.cn';

export const route: Route = {
    path: '/sist/:type?',
    categories: ['university'],
    example: '/ustc/sist/tzgg',
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
            source: ['sist.ustc.edu.cn/'],
            target: '/sist',
        },
    ],
    name: '信息科学技术学院',
    maintainers: ['jasongzy'],
    handler,
    url: 'sist.ustc.edu.cn/',
    description: `| 通知公告 | 招生工作 |
| -------- | -------- |
| tzgg     | zsgz     |`,
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
    let items = $('div[portletmode=simpleList]')
        .find('div.card')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.card-title > a').attr('title').trim();
            let link = item.find('.card-title > a').attr('href');
            link = link.startsWith('/') ? host + link : link;
            const pubDate = timezone(parseDate(item.find('time').text().replace('发布时间：', ''), 'YYYY-MM-DD'), +8);
            return {
                title,
                pubDate,
                link,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                let desc = '';
                try {
                    const response = await got(item.link);
                    desc = load(response.data)('div.wp_articlecontent').html();
                    item.description = desc;
                } catch {
                    // intranet only contents
                }
                return item;
            })
        )
    );

    return {
        title: info.title,
        link: `${host}/${id}/list.htm`,
        item: items,
    };
}
