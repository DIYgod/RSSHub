import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getContent } from './utils';

const map = new Map([
    ['gstz', { title: '南京理工大学电光学院研学网 -- 公示通知', id: '/6509' }],
    ['xswh', { title: '南京理工大学电光学院研学网 -- 学术文化', id: '/6511' }],
    ['jyzd', { title: '南京理工大学电光学院研学网 -- 就业指导', id: '/6510' }],
]);

const host = 'https://dgxg.njust.edu.cn';

export const route: Route = {
    path: '/dgxg/:type?',
    categories: ['university'],
    example: '/njust/dgxg/gstz',
    parameters: { type: '分类名，见下表，默认为公示通知' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '电光学院研学网',
    maintainers: ['jasongzy'],
    handler,
    description: `| 公示通知 | 学术文化 | 就业指导 |
| -------- | -------- | -------- |
| gstz     | xswh     | jyzd     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'gstz';
    const info = map.get(type);
    if (!info) {
        throw new InvalidParameterError('invalid type');
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = load(html);
    const list = $('ul.wp_article_list').find('li');

    return {
        title: info.title,
        link: siteUrl,
        item: list.toArray().map((item) => ({
            title: $(item).find('a').attr('title').trim(),
            pubDate: timezone(parseDate($(item).find('span.Article_PublishDate').text(), 'YYYY-MM-DD'), +8),
            link: $(item).find('a').attr('href'),
        })),
    };
}
