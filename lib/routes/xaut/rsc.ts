import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/rsc/:category?',
    categories: ['university'],
    example: '/xaut/rsc/tzgg',
    parameters: { category: '通知类别，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '人事处',
    maintainers: ['mocusez', 'light0926'],
    handler,
    description: `::: warning
有些内容指向外部链接，目前只提供这些链接，不提供具体内容，去除 jwc 和 index 的修改
:::

| 通知公告 | 工作动态 |
| :------: | :------: |
|   tzgg   |   gzdt   |`,
};

async function fetchDetail(link: string): Promise<Pick<DataItem, 'description' | 'author' | 'pubDate'>> {
    if (new URL(link).hostname !== 'renshichu.xaut.edu.cn') {
        return {};
    }
    const response = await got(link);
    const content = load(response.body);
    const form = content('form[name="_newscontent_fromname"]');
    const description =
        (form.children('.con_con').html() ?? '') +
        form
            .children('ul')
            .toArray()
            .map((attachment) => content.html(attachment))
            .join('');
    const author =
        form
            .children('h3')
            .find('span')
            .filter((_, span) => content(span).text().startsWith('作者：'))
            .text()
            .replace(/^作者：/, '') || undefined;
    const rawDate = form
        .find('h3 span:contains(时间)')
        .text()
        .replace(/^时间：/, '');
    const pubDate = rawDate ? timezone(parseDate(rawDate, 'YYYY-MM-DD', true), 8) : undefined;
    return { description, author, pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined };
}

async function handler(ctx) {
    let category = ctx.req.param('category');
    const categoryPaths = { tzgg: 'tzgg.htm', gzdt: 'gzdt.htm' };
    const categoryTitles = { tzgg: '通知公告', gzdt: '工作动态' };

    if (categoryTitles[category] === undefined) {
        category = 'tzgg';
    }

    const response = await got({
        method: 'get',
        url: 'http://renshichu.xaut.edu.cn/' + categoryPaths[category],
    });
    const data = response.body;
    const $ = load(data);

    const list = $('.vsb-space.n_right .list .cleafix')
        .toArray()
        .filter((item) => $(item).find('.list_wen a').first().attr('href'))
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.list_wen a').eq(0).attr('href');
            const link = new URL(a!, 'http://renshichu.xaut.edu.cn/' + categoryPaths[category]).href;
            const title = $item.find('.list_wen a.tit').text();
            const yearMonth = $item.find('.list_time .month').text();
            const day = $item.find('.list_time .day').text();
            const pubDate = yearMonth && day ? timezone(parseDate(`${yearMonth}-${day.padStart(2, '0')}`, 'YYYY-MM-DD', true), 8) : undefined;
            return {
                title,
                link,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });
    return {
        title: '西安理工大学人事处-' + categoryTitles[category],
        link: 'http://renshichu.xaut.edu.cn',
        description: '西安理工大学人事处-' + categoryTitles[category],
        item: await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`xaut:rsc:detail:v4:${item.link}`, () => fetchDetail(item.link!));
                return { ...item, description: detail.description, author: detail.author, pubDate: detail.pubDate ?? item.pubDate };
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
