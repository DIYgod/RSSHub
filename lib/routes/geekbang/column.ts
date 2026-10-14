import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/column/:cid',
    categories: ['programming'],
    example: '/geekbang/column/48',
    parameters: { cid: '专栏 id，可从[全部专栏](https://time.geekbang.org/paid-content)进入专栏介绍页，在 URL 中找到' },
    name: '专栏文章',
    maintainers: ['fengchang'],
    handler,
};

async function handler(ctx: Context) {
    const { cid: columnId } = ctx.req.param();
    const parsedColumnId = Number(columnId);
    if (!/^\d+$/.test(columnId) || !Number.isSafeInteger(parsedColumnId) || parsedColumnId < 1) {
        throw new InvalidParameterError('Column ID must be a positive integer from a Geekbang column introduction URL.');
    }

    // Get column introduction including column name and description
    const introResponse = await ofetch('https://time.geekbang.org/serv/v3/column/info', {
        method: 'POST',
        body: { product_id: parsedColumnId },
    });
    if (introResponse.code !== 0 || !introResponse.data?.title) {
        throw new Error(`Failed to load Geekbang column ${columnId}: ${introResponse.error?.msg ?? 'Check that the column exists and is publicly accessible.'} (code ${introResponse.error?.code ?? introResponse.code ?? 'unknown'}).`);
    }

    // Get latest articles
    const latestResponse = await ofetch('https://time.geekbang.org/serv/v1/column/articles', {
        method: 'POST',
        body: { cid: columnId, size: 500, prev: 0, order: 'latest', sample: false },
    });
    if (latestResponse.code !== 0 || !Array.isArray(latestResponse.data?.list)) {
        throw new Error(
            `Failed to load articles for Geekbang column ${columnId}: ${latestResponse.error?.msg ?? 'The article list is unavailable. Try again later.'} (code ${latestResponse.error?.code ?? latestResponse.code ?? 'unknown'}).`
        );
    }

    const out = latestResponse.data.list.map((item) => ({
        title: item.article_title,
        pubDate: parseDate(item.article_ctime, 'X'),
        link: `https://time.geekbang.org/column/article/${item.id}`,
        description: item.article_summary,
    }));

    return {
        title: introResponse.data.title,
        link: `https://time.geekbang.org/column/intro/${columnId}`,
        description: introResponse.data.subtitle,
        image: introResponse.data.cover?.square,
        item: out,
    };
}
