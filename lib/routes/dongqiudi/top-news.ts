import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/top_news/:id?',
    categories: ['new-media'],
    example: '/dongqiudi/top_news/1',
    parameters: { id: '类别 id，不填默认头条新闻' },
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
            source: ['m.dongqiudi.com/home/:id'],
            target: '/top_news/:id',
        },
    ],
    name: '新闻',
    maintainers: ['HendricksZheng'],
    handler,
    description: `| 头条 | 深度 | 闲情 | D 站 | 中超 | 国际 | 英超 | 西甲 | 意甲 | 德甲 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | 1    | 55   | 37   | 219  | 56   | 120  | 3    | 5    | 4    | 6    |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 1;
    const { data } = await got(`https://api.dongqiudi.com/app/tabs/web/${id}.json`);
    const articles = data.articles;
    const label = data.label;

    const list = articles.map((item) => ({
        title: item.title,
        link: `https://www.dongqiudi.com/articles/${item.id}.html`,
        category: [item.category, ...(item.secondary_category ?? [])],
        pubDate: parseDate(item.show_time),
    }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                utils.ProcessFeedType2(item, response);
                return item;
            })
        )
    );

    return {
        title: `懂球帝 - ${label}`,
        link: `https://www.dongqiudi.com/articlesList/${id}`,
        item: out.filter((e) => e !== undefined),
    };
}
