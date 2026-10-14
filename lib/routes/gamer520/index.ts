import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:category?/:order?',
    categories: ['game'],
    example: '/gamer520/gameswitch',
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

| 所有 | Switch 游戏下载 | 金手指     | 3A 巨作 | switch 主题 | PC PLAY |
| ---- | --------------- | ---------- | ------- | ----------- | ------- |
| all  | gameswitch      | jinshouzhi | 3ajuzuo | zhuti       | pcplay  |`,
};

interface Post {
    id: number;
    guid: { rendered: string };
    title: { rendered: string };
    date_gmt: string;
    modified_gmt: string;
    categories?: number[];
    content: { rendered: string };
}

interface Category {
    id: number;
    name: string;
    link: string;
    slug: string;
}

function getCategories(baseUrl: string): Promise<Category[]> {
    return cache.tryGet('gamer520:categories:v2', async () => {
        const { data } = await got(`${baseUrl}/wp-json/wp/v2/categories`, { searchParams: { per_page: 100 } });
        return data.map((category) => ({ slug: category.slug, id: category.id, name: category.name, link: category.link }));
    });
}

async function handler(ctx: Context): Promise<Data> {
    const baseUrl = 'https://www.gamer520.com';
    const categories = await getCategories(baseUrl);

    const category = ctx.req.param('category') ?? 'all';
    const order = ctx.req.param('order');
    const categoryId = categories.find((c) => c.slug === category)?.id;
    if (category !== 'all' && categoryId === undefined) {
        throw new InvalidParameterError(`Unknown Gamer520 category "${category}". Choose all or a current category: ${categories.map((item) => item.slug).join(', ')}`);
    }

    const limit = Math.min(getRouteLimit(ctx, 10), 100);
    const { data }: { data: Post[] } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: categoryId,
            orderby: order,
            per_page: limit,
        },
    });

    const items: DataItem[] = data.map((item) => {
        const $ = load(item.content.rendered, null, false);
        $('script, style').remove();
        return {
            guid: `gamer520:${item.id}`,
            title: item.title.rendered,
            link: item.guid.rendered,
            pubDate: parseDate(item.date_gmt + 'Z'),
            updated: parseDate(item.modified_gmt + 'Z'),
            category: item.categories?.map((c) => categories.find((ca) => ca.id === c)?.name ?? '').filter((c) => c !== '') ?? [],

            description: $.html(),
        };
    });

    return {
        title: '全球游戏交流中心-' + (categories.find((c) => c.slug === category)?.name ?? '所有'),
        link: categories.find((c) => c.slug === category)?.link ?? baseUrl,
        item: items,
    };
}
