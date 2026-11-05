import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        .map((item): DataItem => {
            const elem = $(item);
            const title = elem.find('.Article_Title > a').attr('title');
            let link = elem.find('.Article_Title > a').attr('href');
            link = link!.startsWith('/') ? host + link : link;
            const published = elem.find('.Article_PublishDate').text().trim();
            const pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined;
            return {
                title: title!,
                pubDate,
                link,
            };
        });
    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`ustc:math:detail:${item.link}`, async () => {
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
        title: info.title,
        link: `${host}/${id}/list.htm`,
        item: items,
    };
}
