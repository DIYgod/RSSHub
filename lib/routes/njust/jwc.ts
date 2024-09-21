import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { getContent } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const map = new Map([
    ['jstz', { title: '南京理工大学教务处 -- 教师通知', id: '/1216' }],
    ['xstz', { title: '南京理工大学教务处 -- 学生通知', id: '/1217' }],
    ['xw', { title: '南京理工大学教务处 -- 新闻', id: '/1218' }],
    ['xydt', { title: '南京理工大学教务处 -- 学院动态', id: '/1219' }],
]);

const host = 'https://jwc.njust.edu.cn';

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/njust/jwc/xstz',
    parameters: { type: '分类名，见下表，默认为学生通知' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['MilkShakeYoung', 'jasongzy'],
    handler,
    description: `| 教师通知 | 学生通知 | 新闻 | 学院动态 |
  | -------- | -------- | ---- | -------- |
  | jstz     | xstz     | xw   | xydt     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'xstz';
    const info = map.get(type);
    if (!info) {
        throw new InvalidParameterError('invalid type');
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = load(html);
    const list = $('div#wp_news_w3').find('tr');

    return {
        title: info.title,
        link: siteUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').attr('title').trim(),
                    pubDate: timezone(parseDate($(item).find('td[width="14%"]').text(), 'YYYY-MM-DD'), +8),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    };
}
