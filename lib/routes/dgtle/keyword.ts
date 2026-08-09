import type { Context } from 'hono';
import sanitizeHtml from 'sanitize-html';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/trade/search/:keyword',
    categories: ['social-media'],
    example: '/dgtle/trade/search/ipad',
    parameters: { keyword: '搜索关键词' },
    name: '闲置（关键词）',
    maintainers: ['gaoliang', 'hoilc'],
    handler,
};

async function handler(ctx: Context) {
    const { keyword } = ctx.req.param();

    const url = `https://www.dgtle.com/search?search_word=${encodeURIComponent(keyword)}`;

    const response = await ofetch(`https://www.dgtle.com/search/sale?search_word=${encodeURIComponent(keyword)}&page=1`, {
        headers: {
            Referer: url,
        },
    });

    const list = response.data.dataList;

    return {
        title: `数字尾巴 - 闲置 - ${keyword}`,
        link: url,
        item: list.map((item) => ({
            title: sanitizeHtml(item.title, { allowedTags: [], allowedAttributes: {} }),
            author: item.author.username,
            description: `<p>价格: ¥${item.price}</p><p>地址: ${item.address}</p><p>${item.content}</p><img src="${item.cover}" style="max-width: 100%;"/>`,
            pubDate: parseDate(item.created_at * 1000),
            link: `https://www.dgtle.com/sale-${item.id}-1.html`,
        })),
    };
}
