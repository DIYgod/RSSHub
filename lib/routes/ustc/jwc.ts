import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const noticeUrl = 'https://www.teach.ustc.edu.cn/category/notice';
const noticeType = { teaching: '教学', info: '信息', exam: '考试', exchange: '交流' };
export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/ustc/jwc/info',
    parameters: { type: '分类，默认显示所有种类' },
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
            source: ['www.teach.ustc.edu.cn/'],
            target: '/jwc',
        },
    ],
    name: '教务处通知新闻',
    maintainers: ['hang333'],
    handler,
    url: 'www.teach.ustc.edu.cn/',
    description: `| 信息 | 教学     | 考试 | 交流     |
| ---- | -------- | ---- | -------- |
| info | teaching | exam | exchange |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type') ?? '';
    const response = await got({
        method: 'get',
        /* headers: {
            'user-agent': UA,
        }, */
        url: `${noticeUrl}${type === '' ? '' : '-' + type}`,
    });
    const $ = load(response.data);
    let items = $(type === '' ? 'ul[class="article-list with-tag"] > li' : 'ul[class=article-list] > li')
        .toArray()
        .map((element) => {
            const child = $(element).children();
            const published = $(element).find('.date').text().trim();
            const info: DataItem = {
                title: type === '' ? $(child[0]).find('a').text() + ' - ' + $(child[1]).find('a').text() : $(child[0]).find('a').text(),
                link: type === '' ? $(child[1]).find('a').attr('href') : $(child[0]).find('a').attr('href'),
                pubDate: published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined,
            };
            return info;
        });
    items = await pMap(
        items.filter((item) => item.link),
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author' | 'category' | 'updated'>>(`ustc:jwc:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author' | 'category' | 'updated'> = {};
                const response = await got(item.link);
                const $ = load(response.data);
                const modified = $('li.meta-last-modified').text().trim();
                details.updated = modified ? timezone(parseDate(modified, 'YYYY-MM-DD HH:mm'), 8) : undefined;
                const categories = mapElements($('li.meta-categories a'), (_, element) => $(element).text());
                details.category = categories.length ? categories : undefined;
                // www.teach ?? pms.cmet ?? news
                const content = $('main[class=single]');
                details.author =
                    content
                        .find('address.signature')
                        .text()
                        .replace(/\d{4}年\d{1,2}月\d{1,2}日\s*$/, '')
                        .trim() || undefined;
                content.find('address.signature').remove();
                details.description = content.html() ?? $('.card-footer').html() ?? $('.v_news_content').html();
                details.pubDate = $('li[class=meta-date]').text() ? timezone(parseDate($('li[class=meta-date]').text(), 'YYYY-MM-DD HH:mm'), 8) : undefined;
                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    const desc = type === '' ? '中国科学技术大学教务处 - 通知新闻' : `中国科学技术大学教务处 - ${noticeType[type]}类通知`;
    return {
        title: desc,
        description: desc,
        link: `${noticeUrl}${type === '' ? '' : '-' + type}`,
        item: items,
    };
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
