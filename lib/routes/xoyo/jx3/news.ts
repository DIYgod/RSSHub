import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const categories = {
    latest: {
        name: '最新',
        query: {
            action: 'get_customer_article_mix_list',
            game: 'jx3',
            mixcatid: '2458,2461',
        },
    },
    news: {
        name: '新闻',
        query: {
            action: 'get_article_list',
            catid: '2458',
            order_by: 'inputtime',
            sort_by: 'desc',
        },
    },
    activities: {
        name: '活动',
        query: {
            action: 'get_article_list',
            catid: '2461',
            order_by: 'inputtime',
            sort_by: 'desc',
        },
    },
    announce: {
        name: '公告',
        query: {
            action: 'get_customer_article_list',
            game: 'jx3',
        },
    },
};

export const route: Route = {
    path: '/jx3/:caty?',
    categories: ['game'],
    example: '/xoyo/jx3',
    parameters: { caty: '分类，见下表，默认为最新' },
    name: '剑网 3 新闻资讯',
    maintainers: ['nczitzk', 'TonyRL'],
    description: `| 最新   | 新闻 | 活动       | 公告     |
| ------ | ---- | ---------- | -------- |
| latest | news | activities | announce |`,
    handler,
    url: 'jx3.xoyo.com',
};

type DetailQuery = { action: string; game?: string; kid?: string; catid?: string; id?: string };

function parseArticleDate(value?: string | number | null) {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp)) {
        return;
    }
    const date = parseDate(timestamp, 'X');
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function fetchArticleContent(detailQuery: DetailQuery): Promise<Pick<DataItem, 'description'>> {
    const detail = await ofetch('https://jx3.xoyo.com/api.php', {
        query: { op: 'search_api', ...detailQuery },
        responseType: 'json',
    });
    return { description: ('kid' in detailQuery ? detail.data : detail.data[0])?.content };
}

async function handler(ctx: Context) {
    const { caty = 'latest' } = ctx.req.param();
    const category = categories[caty];
    const parsedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
    const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 30;

    const rootUrl = 'https://jx3.xoyo.com';
    const response = await ofetch(`${rootUrl}/api.php`, {
        query: {
            op: 'search_api',
            page: 1,
            num: limit,
            ...category.query,
        },
        responseType: 'json',
    });

    const list: Array<DataItem & { link: string; detailQuery: DetailQuery }> = response.data.list.map((article) => {
        const isCustomer = article.catid === '0';
        return {
            title: article.title,
            link: `${rootUrl}/index/index.html#/article-details?${isCustomer ? `kid=${article.id}` : `catid=${article.catid}&id=${article.id}`}`,
            description: article.description,
            pubDate: parseArticleDate(article.inputtime),
            detailQuery: isCustomer ? { action: 'get_customer_article_detail', game: 'jx3', kid: article.id } : { action: 'get_article_detail', catid: article.catid, id: article.id },
        };
    });

    const items = await pMap(
        list,
        async ({ detailQuery, ...item }) => {
            const detail = await cache.tryGet(`xoyo:jx3:article:${item.link}`, () => fetchArticleContent(detailQuery));
            return { ...item, description: detail.description || item.description };
        },
        { concurrency: 3 }
    );

    return {
        title: `${category.name} - 剑网3`,
        link: `${rootUrl}/index/index.html#/${caty}`,
        item: items,
    };
}
