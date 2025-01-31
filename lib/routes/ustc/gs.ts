import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const map = new Map([
    ['tzgg', { title: '中国科学技术大学研究生院 - 通知公告', id: '9' }],
    ['xwdt', { title: '中国科学技术大学研究生院 - 新闻动态', id: '10' }],
]);

const host = 'https://gradschool.ustc.edu.cn';

export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/ustc/gs/tzgg',
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
            source: ['gradschool.ustc.edu.cn/'],
            target: '/gs',
        },
    ],
    name: '研究生院',
    maintainers: ['jasongzy'],
    handler,
    url: 'gradschool.ustc.edu.cn/',
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

    const response = await got(`${host}/column/${id}`);
    const $ = load(response.data);
    let items = $('div.r-box > ul')
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').text().trim();
            const link = item.find('a').attr('href').startsWith('/article') ? host + item.find('a').attr('href') : item.find('a').attr('href');
            const pubDate = timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD'), +8);
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
                    desc = load(response.data)('article.article').html();
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
        link: `${host}/column/${id}`,
        item: items,
    };
}
