import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { fetchDataItemCached, getArticleList } from './fetcher';

export const route: Route = {
    path: '/category/:category',
    categories: ['game'],
    example: '/yystv/category/recommend',
    parameters: { category: '专栏类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类文章',
    maintainers: ['betta-cyber', 'dousha'],
    handler,
    description: `| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 | 业界     |
| --------- | ------- | ------ | ------- | ---- | -------- | -------- |
| recommend | history | big    | culture | news | retro    | industry |`,
};

type ArticleEntry = DataItem & { link: string };

function getDescription(items: ArticleEntry[]): Promise<DataItem[]> {
    return Promise.all(
        items.map((item) =>
            fetchDataItemCached(item.link, (pageContent) => {
                const $ = load(pageContent);
                const articleContent = $('.doc-content.rel > div').html();

                const assembledItem: DataItem = { ...item, description: articleContent };
                return assembledItem;
            })
        )
    );
}

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `https://www.yystv.cn/b/${category}`;
    const response = await ofetch(url);
    const $ = load(response);

    const items = await getDescription(getArticleList($));
    return {
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/b/${category}`,
        item: items,
    };
}
