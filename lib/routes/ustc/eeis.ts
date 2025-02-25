import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import InvalidParameterError from '@/errors/types/invalid-parameter';

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
        .find('article')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h4 > a').eq(1).attr('title').trim();
            let link = item.find('h4 > a').attr('href');
            link = link.startsWith('/') ? host + link : link;
            const pubDate = timezone(parseDate(item.find('.post-date > time').text().replace('发布时间：', ''), 'YYYY-MM-DD'), +8);
            return {
                title,
                pubDate,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
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
