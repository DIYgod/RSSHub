import { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { Context } from 'hono';

export const route: Route = {
    path: '/:category?/:order?',
    categories: ['game'],
    example: '/gamer520/switchyouxi',
    parameters: {
        category: '分类，见下表',
        order: '排序，发布日期: date; 修改日期: modified',
    },
    features: {
        antiCrawler: true,
    },
    name: '文章',
    maintainers: ['xzzpig'],
    handler,
    url: 'www.gamer520.com/',
    description: `分类

  | 所有 | Switch游戏下载 | 金手指 | 3A巨作 | switch主题 | PC游戏 |
  | --- | --- | --- | --- | --- | --- |
  | all | switchyouxi | jinshouzhi | 3ajuzuo | zhuti | pcgame |`,
};

// (await (await fetch('https://www.gamer520.com/wp-json/wp/v2/categories')).json()).map((category) => ({ slug: category.slug, id: category.id, name: category.name, link: category.link }));
const CATEGORY_ARRAY = [
    {
        slug: 'shen',
        id: 1,
        name: '[神の贴]',
        link: 'https://www.gamer520.com/shen'
    },
    {
        slug: '3ajuzuo',
        id: 4,
        name: '3A巨作',
        link: 'https://www.gamer520.com/3ajuzuo'
    },
    {
        slug: 'cth',
        id: 1481,
        name: 'CTH',
        link: 'https://www.gamer520.com/cth'
    },
    {
        slug: 'offline-game-trainer',
        id: 1483,
        name: 'PC单机游戏修改器',
        link: 'https://www.gamer520.com/offline-game-trainer'
    },
    {
        slug: 'pcsmall',
        id: 1477,
        name: 'PC小仓库[持续更新]',
        link: 'https://www.gamer520.com/pcsmall'
    },
    {
        slug: 'pcgame',
        id: 1471,
        name: 'PC游戏下载',
        link: 'https://www.gamer520.com/pcgame'
    },
    {
        slug: 'zhuti',
        id: 1476,
        name: 'switch主题',
        link: 'https://www.gamer520.com/zhuti'
    },
    {
        slug: 'switchyouxi',
        id: 2,
        name: 'Switch游戏下载',
        link: 'https://www.gamer520.com/switchyouxi'
    },
    {
        slug: 'zhongwen',
        id: 1461,
        name: '中文',
        link: 'https://www.gamer520.com/zhongwen'
    },
    {
        slug: 'jinshouzhi',
        id: 3,
        name: '加藤之指',
        link: 'https://www.gamer520.com/jinshouzhi'
    }
];

interface Post {
    id: number,
    guid: { rendered: string },
    title: { rendered: string },
    date_gmt: string,
    modified_gmt: string,
    categories?: number[],
    content: { rendered: string },
}

async function handler(ctx?: Context): Promise<Data> {
    const category = ctx?.req.param('category') ?? 'all';
    const order = ctx?.req.param('order');
    const categoryId = CATEGORY_ARRAY.find((c) => c.slug === category)?.id;

    const baseUrl = 'https://www.gamer520.com';

    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: categoryId,
            orderby: order,
            per_page: ctx?.req.query('limit') ? Number.parseInt(ctx?.req.query('limit') as string) : undefined,
        },
    }) as unknown as { data: Post[] };

    const items: DataItem[] = data
        .map((item) => ({
            guid: `gamer520:${item.id}`,
            title: item.title.rendered,
            link: item.guid.rendered,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
            category: item.categories?.map((c) => CATEGORY_ARRAY.find((ca) => ca.id === c)?.name ?? '').filter((c) => c !== '') ?? [],
            description: item.content.rendered,
        }));

    return {
        title: '全球游戏交流中心-' + (CATEGORY_ARRAY.find((c) => c.slug === category)?.name ?? '所有'),
        link: CATEGORY_ARRAY.find((c) => c.slug === category)?.link ?? baseUrl,
        item: items,
    };
}
