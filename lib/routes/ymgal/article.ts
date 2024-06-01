import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.ymgal.games';

const types = {
    news: '?type=NEWS&page=1',
    column: '?type=COLUMN&page=1',
};

export const route: Route = {
    path: '/article/:type?',
    categories: ['anime'],
    example: '/ymgal/article',
    parameters: { type: '文章类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['SunBK201'],
    handler,
    description: `| 全部文章 | 资讯 | 专栏   |
  | -------- | ---- | ------ |
  | all      | news | column |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'all';

    const link = `${host}/co/topic/list` + types[type];
    let data = [];
    if (type === 'all') {
        await Promise.all(
            Object.values(types).map(async (type) => {
                const response = await got(`${host}/co/topic/list${type}`);
                data.push(...response.data.data);
            })
        );
        data = data.sort((a, b) => b.publishTime - a.publishTime).slice(0, 10);
    } else {
        const response = await got(link);
        data = response.data.data;
    }

    const items = await Promise.all(
        data.map((item) => {
            const itemUrl = host + '/co/article/' + item.topicId;
            return cache.tryGet(itemUrl, async () => {
                const result = await got(itemUrl);
                const $ = load(result.data);
                const description = $('article').html().trim();
                return {
                    title: item.title,
                    link: itemUrl,
                    pubDate: timezone(parseDate(item.publishTime), 8),
                    description,
                };
            });
        })
    );

    let info = '全部文章';
    if (type === 'news') {
        info = '资讯';
    } else if (type === 'column') {
        info = '专栏';
    }

    return {
        title: `月幕 Galgame - ${info}`,
        link: `${host}/co/article`,
        description: `月幕 Galgame - ${info}`,
        item: items,
    };
}
