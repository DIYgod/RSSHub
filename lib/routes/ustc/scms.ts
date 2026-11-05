import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
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
            source: ['scms.ustc.edu.cn/:type/list.htm'],
            target: '/scms/:type',
        },
    ],
    name: '化学与材料科学学院',
    maintainers: ['boxie123'],
    handler,
    url: 'scms.ustc.edu.cn/',
    description: `| 院内新闻 | 通知公告 | 科研动态 | 学术活动 | 其他      |
| -------- | -------- | -------- | -------- | --------- |
| ynxw     | tzgg     | kydt     | xshd     | 自定义 id |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const info = map.get(type);

    // if (!info) {
    //     throw new InvalidParameterError('invalid type');
    // }
    const id = info?.id ?? type;
    const response = await got(`${host}/${id}/list.htm`);
    const $ = load(response.data);
    const pageTitle = info?.title ?? $('head > title').text();
    const list = $('.col_news_list .news_list > li').length ? $('.col_news_list .news_list > li') : $('#wp_news_w6 > .wp_article_list > .list_item');
    let items = list.toArray().map((item): DataItem => {
        const elem = $(item);
        const anchor = elem.find('.Article_Title > a, a').first();
        const title = anchor.attr('title') ?? (elem.find('.news_title').length ? elem.find('.news_title').text() : anchor.text());
        let link = anchor.attr('href');
        link = link!.startsWith('/') ? host + link : link;
        const published = elem.find('.Article_PublishDate, .news_meta').text().trim();
        const pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined;
        return {
            title,
            pubDate,
            link,
        };
    });
    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`ustc:scms:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author'> = {};
                try {
                    const response = await got(item.link);
                    const $detail = load(response.data);
                    details.description = $detail('div.wp_articlecontent').html();
                    details.author =
                        $detail('.arti_publisher')
                            .text()
                            .replace(/^发布者[：:]\s*/, '')
                            .trim() || undefined;
                } catch {
                    // Intranet only contents
                }
                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: `中国科学技术大学化学与材料科学学院 - ${pageTitle}`,
        link: `${host}/${id}/list.htm`,
        item: items,
    };
}
