import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'https://scai.swjtu.edu.cn';

export const route: Route = {
    path: '/scai/:type',
    categories: ['university'],
    example: '/swjtu/scai/bks',
    parameters: { type: '通知类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '计算机与人工智能学院 - 本科生教育',
            source: ['scai.swjtu.edu.cn/', 'scai.swjtu.edu.cn/web/page-module.html'],
            target: '/scai/bks',
        },
        {
            title: '计算机与人工智能学院 - 研究生教育',
            source: ['scai.swjtu.edu.cn/', 'scai.swjtu.edu.cn/web/page-module.html'],
            target: '/scai/yjs',
        },
        {
            title: '计算机与人工智能学院 - 学生工作',
            source: ['scai.swjtu.edu.cn/', 'scai.swjtu.edu.cn/web/page-module.html'],
            target: '/scai/xsgz',
        },
    ],
    name: '计算机与人工智能学院',
    description: `| 分区       | 参数 |
| ---------- | ---- |
| 本科生教育 | bks  |
| 研究生教育 | yjs  |
| 学生工作   | xsgz |`,
    maintainers: ['AzureG03', 'SuperJeason'],
    handler,
};

const partition = {
    bks: {
        title: '本科生教育',
        url: `${rootURL}/web/page-module.html?mid=B730BEB095B31840`,
    },
    yjs: {
        title: '研究生教育',
        url: `${rootURL}/web/page-module.html?mid=6A69B0E32021446B`,
    },
    xsgz: {
        title: '学生工作',
        url: `${rootURL}/web/page-module.html?mid=F3D3909EB1861B5D`,
    },
};

const getCalendarDate = (parts: string[] | undefined): Date | undefined => {
    const date = parts ? parseDate(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`, 'YYYY-MM-DD', true) : undefined;
    return date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined;
};

async function getArticle(link: string): Promise<Partial<DataItem>> {
    const res = await ofetch(link);
    const $ = load(res);
    const dateText = $('div.news-info span:nth-of-type(2)').text() || $('div.news-top-bar span:nth-of-type(1)').text();
    const item: Partial<DataItem> = { description: $('div.content-main').html() };
    const pubDate = getCalendarDate(dateText.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/)?.slice(1));
    if (pubDate) {
        item.pubDate = pubDate;
    }
    return item;
}

const getItem = async (item) => {
    const title = item.find('a').text();
    const link = `${rootURL}${item.find('a').attr('href').slice(2)}`;
    const calendar = item.find('.calendar');
    const yearMonth = calendar
        .find('.date')
        .text()
        .match(/(\d{4})\/(\d{1,2})/);
    const day = calendar.find('.day').text().trim();
    const pubDate = getCalendarDate(yearMonth && /^\d{1,2}$/.test(day) ? [yearMonth[1], yearMonth[2], day] : undefined);
    return { title, link, pubDate, ...(await cache.tryGet(`swjtu:scai:article:${link}`, () => getArticle(link))) };
};

async function handler(ctx) {
    const { type } = ctx.req.param();
    if (!Object.hasOwn(partition, type)) {
        throw new InvalidParameterError('Unsupported notice type. Use bks, yjs, or xsgz.');
    }
    const url = partition[type].url;
    const res = await ofetch(url);

    const $ = load(res);
    const $list = $('div.list-top-item, div.item-wrapper');

    const items = await pMap(
        $list.toArray(),
        (i) => {
            const $item = $(i);
            return getItem($item);
        },
        { concurrency: 3 }
    );

    return {
        title: `西南交大计院-${partition[type].title}`,
        link: url,
        item: items,
    };
}
