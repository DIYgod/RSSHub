import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// Yep http is bad, but I had no choice :(
const rootMeta = {
    url: 'http://jiaowu.xaufe.edu.cn/',
    title: '西安财经大学 教务处（招生办公室）',
};

const categories = {
    tzgg: {
        title: '通知公告',
        url: 'index/tzgg.htm',
    },
};

async function fetchDetail(link: string): Promise<Pick<DataItem, 'author' | 'description'>> {
    const response = await got({ method: 'get', url: link });
    const $ = load(response.body);
    return {
        author: /作者：(\S*)\s{4}/.exec($('p', '.main_contit').text())?.[1] || undefined,
        description: $('#vsb_content').html(),
    };
}

export const route: Route = {
    path: '/jiaowu/:category?',
    categories: ['university'],
    example: '/xaufe/jiaowu/tzgg',
    parameters: { category: '分类，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['shaokeyibb'],
    handler,
    description: `| 通知公告 |
| :------: |
|   tzgg   |`,
};

async function handler(ctx) {
    const pCategory = ctx.req.param('category');
    const category = categories[pCategory] || categories.tzgg;

    const response = (
        await got({
            method: 'get',
            url: rootMeta.url + category.url,
        })
    ).body;

    const $ = load(response);

    const data = $('.main_conRCb ul li')
        .slice(0, 16)
        .toArray()
        .filter((item) => $(item).children('a').attr('href'))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const rawDate = $item.children('span').text();
            const pubDate = rawDate ? parseDate(rawDate, 'YYYY-MM-DD', true) : undefined;
            const title = $item.find('a em').text();
            const link = new URL($item.children('a').attr('href')!, rootMeta.url + category.url).href;
            return {
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
                title,
                link,
            };
        });

    return {
        title: `${category.title}-${rootMeta.title}`,
        link: rootMeta.url + category.url,
        description: `${category.title}-${rootMeta.title}`,
        language: 'zh-CN' as const satisfies Language,
        item: await pMap(
            data,
            async (item) => {
                const detail = await cache.tryGet(`xaufe:detail:v1:${item.link}`, () => fetchDetail(item.link));
                return { ...item, author: detail.author, description: detail.description };
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
