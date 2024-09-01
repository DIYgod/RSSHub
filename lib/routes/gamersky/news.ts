import type { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import type { Context } from 'hono';
import { ofetch } from 'ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import cache from '@/utils/cache';
import { mdTableBuilder } from './review';

const idNameMap = [
    {
        type: 'today',
        name: '今日推荐',
    },
    {
        name: '单机电玩',
        type: 'pc',
    },
    {
        name: 'NS',
        type: 'ns',
    },
    {
        name: '手游',
        type: 'mobile',
    },
    {
        name: '网游',
        type: 'web',
    },
    {
        name: '业界',
        type: 'industry',
    },
    {
        name: '硬件',
        type: 'hardware',
    },
    {
        name: '科技',
        type: 'tech',
    },
];

export const route: Route = {
    path: '/news/:type?',
    categories: ['game'],
    example: '/gamersky/news/pc',
    parameters: {
        type: '资讯类型，见表',
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
            source: ['www.gamersky.com/news'],
            target: '/news',
        },
    ],
    name: '游民星空 - 资讯',
    maintainers: ['yy4382'],
    description: mdTableBuilder(idNameMap),
    handler,
};

async function handler(ctx: Context<any, any, any>) {
    const type = ctx.req.param('type') ?? 'pc';

    const index = idNameMap.findIndex((item) => item.type === type);
    if (index === -1) {
        throw new Error(`Invalid type: ${type}`);
    }

    const response = await ofetch('https://www.gamersky.com/news');
    const $ = load(response);
    const list = $(`div.Mid2_L > div:nth-child(${3 + index}) > ul > li`)
        .toArray()
        .slice(0, 20)
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
                    item.description = $('.Mid2L_con').html() || item.description;
                    return item satisfies DataItem;
                }) as Promise<DataItem>
        )
    );
    return {
        title: `${idNameMap[index].name} - 游民星空`,
        link: 'https://www.gamersky.com/news',
        item: fullTextList,
    };
}
