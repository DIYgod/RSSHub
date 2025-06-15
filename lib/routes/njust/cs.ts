import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { getContent } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const map = new Map([
    ['xyxw', { title: '南京理工大学计算机学院 -- 学院新闻', id: '/1817' }],
    ['tzgg', { title: '南京理工大学计算机学院 -- 通知公告', id: '/1820' }],
    ['xsdt', { title: '南京理工大学计算机学院 -- 学术动态', id: '/5790' }],
]);

const host = 'https://cs.njust.edu.cn';

export const route: Route = {
    path: '/cs/:type?',
    categories: ['university'],
    example: '/njust/cs/xyxw',
    parameters: { type: '分类名，见下表，默认为学院新闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机学院',
    maintainers: ['Horacecxk', 'jasongzy'],
    handler,
    description: `| 学院新闻 | 通知公告 | 学术动态 |
| -------- | -------- | -------- |
| xyxw     | tzgg     | xsdt     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'xyxw';
    const info = map.get(type);
    if (!info) {
        throw new InvalidParameterError('invalid type');
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';
    const html = await getContent(siteUrl, true);
    const $ = load(html);
    const list = $('div#wp_news_w9').find('a');

    return {
        title: info.title,
        link: siteUrl,
        item: list.toArray().map((item) => ({
            title: $(item).find('span[class="column-news-title"]').text().trim(),
            pubDate: timezone(parseDate($(item).find('span[class="column-news-date news-date-hide"]').text(), 'YYYY-MM-DD'), +8),
            link: $(item).attr('href'),
        })),
    };
}
