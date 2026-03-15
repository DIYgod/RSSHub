import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
// import InvalidParameterError from '@/errors/types/invalid-parameter';

const map = new Map([
    ['kydt', { title: '科研动态', id: '2404' }],
    ['tzgg', { title: '通知公告', id: '2402' }],
    ['xshd', { title: '学术活动', id: 'xshd' }],
    ['ynxw', { title: '院内新闻', id: '2405' }],
]);

const host = 'https://scms.ustc.edu.cn';

export const route: Route = {
    path: '/scms/:type?',
    categories: ['university'],
    example: '/ustc/scms/tzgg',
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
            source: ['scms.ustc.edu.cn/:id/list.htm'],
            target: '/scms',
        },
    ],
    name: '化学与材料科学学院',
    maintainers: ['boxie123'],
    handler,
    url: 'scms.ustc.edu.cn/',
    description: `| 院内新闻 | 通知公告 | 科研动态 | 学术活动 | 其他 |
| -------- | -------- | -------- | -------- | -------- |
| ynxw     | tzgg     | kydt     | xshd     | 自定义id  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const info = map.get(type);
    //  ?? { title: `中国科学技术大学化学与材料科学学院 - ${type}`, id: type };
    // if (!info) {
    //     throw new InvalidParameterError('invalid type');
    // }
    const id = info?.id ?? type;

    const response = await got(`${host}/${id}/list.htm`);
    const $ = load(response.data);

    const pageTitle = info?.title ?? $('head > title').text();

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
                let desc: string;
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
        title: `中国科学技术大学化学与材料科学学院 - ${pageTitle}`,
        link: `${host}/${id}/list.htm`,
        item: items,
    };
}
