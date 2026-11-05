import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

const categories = {
    news: '5310',
    announce: '5312,8324,8325,8326,8327',
    events: '5311',
    advertise: '5313',
};

const typeNumber = {
    ...categories,
    all: `5309,${Object.values(categories).join(',')}`,
};

interface NewsItem {
    Title: string;
    Summary: string;
    OutLink?: string;
    PublishDate: string;
    HomeImagePath?: string;
    Id: number;
}

export const route: Route = {
    path: '/zh/:type?',
    categories: ['game'],
    example: '/ff14/zh/news',
    parameters: { type: '分类名，预设为 `all`' },
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
            source: ['ff.web.sdo.com/web8/index.html'],
            target: '/zh',
        },
    ],
    name: '最终幻想 14 国服',
    maintainers: ['Kiotlin', 'ZeroClad', '15x15G'],
    handler,
    url: 'ff.web.sdo.com/web8/index.html',
    description: `| 新闻 | 公告     | 活动   | 广告      | 所有 |
| ---- | -------- | ------ | --------- | ---- |
| news | announce | events | advertise | all  |`,
};

async function handler(ctx) {
    const referer = 'https://ff.web.sdo.com/web8/index.html';
    const type = ctx.req.param('type') ?? 'all';

    if (!Object.hasOwn(typeNumber, type)) {
        throw new InvalidParameterError('Unsupported category. Choose news, announce, events, advertise, or all.');
    }

    const response = await got(`https://cqnews.web.sdo.com/api/news/newsList?gameCode=ff&CategoryCode=${typeNumber[type]}&pageIndex=0&pageSize=50`);

    const data: NewsItem[] = response.data.Data;
    const items = data.map((item) => ({ ...item, pubDate: timezone(parseDate(item.PublishDate), 8) }));
    const limit = getRouteLimit(ctx);
    const sorted = ctx.req.query('sorted') !== 'false';
    const candidates =
        limit === undefined || (sorted && items.some((item) => !Number.isFinite(item.pubDate.getTime()))) ? items : (sorted ? items.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime()) : items).slice(0, limit);
    const posts = await pMap(
        candidates,
        async ({ Title, Summary, OutLink, HomeImagePath, Id, pubDate }) => ({
            title: Title,
            link: OutLink || `https://ff.web.sdo.com/web8/index.html#/newstab/newscont/${Id}`,
            description: OutLink
                ? renderDescription({ image: HomeImagePath, description: Summary })
                : await cache.tryGet(`https://cqnews.web.sdo.com/api/news/newsDetail?gameCode=ff&id=${Id}`, async () => {
                      const response = await got(`https://cqnews.web.sdo.com/api/news/newsDetail?gameCode=ff&id=${Id}`);
                      if (String(response.data.Code) !== '0' || !response.data.Data?.Content) {
                          throw new Error(`The official news API did not provide article ${Id}. Check that the article remains publicly available.`);
                      }
                      return response.data.Data.Content;
                  }),
            pubDate,
        }),
        { concurrency: 3 }
    );

    return {
        title: '最终幻想14（国服）新闻中心',
        link: referer + '#/newstab/newslist',
        language: 'zh-CN' as const,
        description: '《最终幻想14》是史克威尔艾尼克斯出品的全球经典游戏品牌FINAL FANTASY系列的最新作品，IGN获得9.2高分！全球累计用户突破1600万！',
        item: posts,
    };
}
