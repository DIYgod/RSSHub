import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getContent } from './utils';

const map = new Map([
    ['tzgg', { title: '南京理工大学电子工程与光电技术学院 -- 通知公告', id: '/1920' }],
    ['xwdt', { title: '南京理工大学电子工程与光电技术学院 -- 新闻动态', id: '/1919' }],
]);

const host = 'https://eoe.njust.edu.cn';

export const route: Route = {
    path: '/eoe/:type?',
    categories: ['university'],
    example: '/njust/eoe/tzgg',
    parameters: { type: '分类名，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '电光学院',
    maintainers: ['jasongzy'],
    handler,
    description: `| 通知公告 | 新闻动态 |
| -------- | -------- |
| tzgg     | xwdt     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw new InvalidParameterError('invalid type');
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = load(html);
    const list = $('ul.news_ul').find('li');

    return {
        title: info.title,
        link: siteUrl,
        item: list.toArray().map((item) => ({
            title: $(item).find('a').attr('title').trim(),
            pubDate: timezone(parseDate($(item).find('span').text(), 'YYYY-MM-DD'), +8),
            link: $(item).find('a').attr('href'),
        })),
    };
}
