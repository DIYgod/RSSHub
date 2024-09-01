import type { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import type { Context } from 'hono';
import { ofetch } from 'ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
const idNameMap = [
    {
        type: 'pc',
        name: '单机',
    },
    {
        type: 'tv',
        name: '电视',
    },
    {
        type: 'indie',
        name: '独立游戏',
    },
    {
        type: 'web',
        name: '网游',
    },
    {
        type: 'mobile',
        name: '手游',
    },
    {
        type: 'all',
        name: '全部评测',
    },
];

export const route: Route = {
    path: '/review/:type?',
    categories: ['game'],
    example: '/gamersky/review/pc',
    parameters: {
        type: '评测类型，可选值为 `pc`、`tv`、`indie`、`web`、`mobile`、`all`，默认为 `pc`',
    },
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
            source: ['www.gamersky.com/review'],
            target: '/review',
        },
    ],
    name: '游民星空 - 评测',
    maintainers: ['yy4382'],
    description: mdTableBuilder(idNameMap),
    handler,
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type') ?? 'pc';

    const index = idNameMap.findIndex((item) => item.type === type);
    if (index === -1) {
        throw new Error(`Invalid type: ${type}`);
    }

    const response = await ofetch('https://www.gamersky.com/review');
    const $ = load(response);
    const list = $(`div.Mid2_L > div:nth-child(${3 + index}) > ul > li`)
        .toArray()
        .map((item) => {
            const ele = $(item);
            const title = ele.find('.tit > a').text();
            const link = ele.find('.tit > a').attr('href');
            const pubDate = timezone(parseDate(ele.find('.time').text()), 8);
            const description = ele.find('.txt').text();
            if (!link) {
                return;
            }
            return {
                title,
                link,
                pubDate,
                description,
            };
        })
        .filter((item) => item !== undefined) satisfies DataItem[];
    const fullTextList = await Promise.all(
        list.map(
            (item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = $('.MidLcon').html() || item.description;
                    return item satisfies DataItem;
                }) as Promise<DataItem>
        )
    );
    return {
        title: `${idNameMap[index].name} - 游民星空评测`,
        link: 'https://www.gamersky.com/review',
        item: fullTextList,
    };
}

export function mdTableBuilder(data: typeof idNameMap) {
    const table = '|' + data.map((item) => `${item.type}|`).join('') + '\n|' + Array(data.length).fill('---|').join('') + '\n|' + data.map((item) => `${item.name}|`).join('') + '\n';
    return table;
}
