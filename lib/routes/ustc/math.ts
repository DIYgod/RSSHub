import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const map = new Map([
    ['xyxw', { title: '中国科学技术大学数学科学学院 - 学院新闻', id: 'xyxw' }],
    ['tzgg', { title: '中国科学技术大学数学科学学院 - 通知公告', id: 'tzgg' }],
    ['xsjl', { title: '中国科学技术大学数学科学学院 - 学术交流', id: 'xsjl' }],
    ['xsbg', { title: '中国科学技术大学数学科学学院 - 学术报告', id: 'xsbg_18822' }],
]);

const host = 'https://math.ustc.edu.cn';

export const route: Route = {
    path: '/math/:type?',
    categories: ['university'],
    example: '/ustc/math/tzgg',
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
            source: ['math.ustc.edu.cn/'],
            target: '/math',
        },
    ],
    name: '数学科学学院',
    maintainers: ['ne0-wu'],
    handler,
    url: 'math.ustc.edu.cn/',
    description: `| 学院新闻 | 通知公告 | 学术交流 | 学术报告 |
  | -------- | -------- | -------- | -------- |
  | xyxw     | tzgg     | xsjl     | xsbg     |`,
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

    let items = $('#wp_news_w6 > .wp_article_list > .list_item')
        .toArray()
        .map((item) => {
            const elem = $(item);
            const title = elem.find('.Article_Title > a').attr('title').trim();
            let link = elem.find('.Article_Title > a').attr('href');
            link = link.startsWith('/') ? host + link : link;
            // Assume that the articles are published at 12:00 UTC+8
            const pubDate = timezone(parseDate(elem.find('.Article_PublishDate').text(), 'YYYY-MM-DD'), -4);
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
                    // Intranet only contents
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
