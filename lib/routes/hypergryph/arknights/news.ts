import * as cheerio from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type NewsItem = {
    cid: string;
    tab: string;
    sticky: boolean;
    title: string;
    author: string;
    displayTime: number;
    cover: string;
    extraCover: string;
    brief: string;
};

type InitialData = {
    LATEST: {
        list: NewsItem[];
        total: number;
        end: boolean;
        map: Record<string, NewsItem[]>;
    };
    ANNOUNCEMENT: {
        list: NewsItem[];
        total: number;
        end: boolean;
        map: Record<string, NewsItem[]>;
    };
    ACTIVITY: {
        list: NewsItem[];
        total: number;
        end: boolean;
        map: Record<string, NewsItem[]>;
    };
    NEWS: {
        list: NewsItem[];
        total: number;
        end: boolean;
        map: Record<string, NewsItem[]>;
    };
};

const parseList = (list: NewsItem[]) =>
    list.map((item) => ({
        title: item.title,
        author: item.author,
        description: item.brief.trim().replaceAll('\n', '<br>'),
        link: `https://ak.hypergryph.com/news/${item.cid}`,
        pubDate: parseDate(item.displayTime, 'X'),
    }));

export const route: Route = {
    path: '/arknights/news/:group?',
    categories: ['game'],
    example: '/hypergryph/arknights/news',
    parameters: { group: '分组，默认为 `ALL`' },
    radar: [
        {
            source: ['ak-conf.hypergryph.com/news'],
        },
    ],
    name: '明日方舟 - 游戏公告与新闻',
    maintainers: ['Astrian'],
    handler,
    url: 'ak-conf.hypergryph.com/news',
    description: `
| 全部 | 最新   | 公告         | 活动     | 新闻 |
| ---- | ------ | ------------ | -------- | ---- |
| ALL  | LATEST | ANNOUNCEMENT | ACTIVITY | NEWS |`,
};

async function handler(ctx) {
    const { group = 'ALL' } = ctx.req.param();

    const initialData: Promise<InitialData> = await cache.tryGet(
        'hypergryph:arknights:news',
        async () => {
            const response = await ofetch('https://ak.hypergryph.com/news');
            const $ = cheerio.load(response);
            const renderData = JSON.parse(
                $('script:contains("initialData")')
                    .first()
                    .text()
                    .match(/self\.__next_f\.push\((.+)\)/)?.[1] ?? ''
            );
            return JSON.parse(renderData[1].slice(2))[3].initialData as InitialData;
        },
        config.cache.routeExpire,
        false
    );

    const list = group === 'ALL' ? Object.values(initialData).flatMap(({ list }) => parseList(list)) : parseList(initialData[group].list);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);

                const description = $('div > div > div > div > div > div > div:nth-child(4)');
                item.description = description.length ? description.html() : item.description;

                return item;
            })
        )
    );

    return {
        title: '《明日方舟》游戏公告与新闻',
        link: 'https://ak.hypergryph.com/news',
        item: items,
        language: 'zh-cn',
    };
}
