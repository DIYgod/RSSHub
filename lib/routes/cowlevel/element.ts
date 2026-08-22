import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/element/:id',
    categories: ['game'],
    example: '/cowlevel/element/1370',
    parameters: { id: '元素 ID, 可在 URL 中找到' },
    radar: [{ source: ['cowlevel.net/element/:id', 'cowlevel.net/element/:id/article'] }],
    name: '元素文章',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const url = `https://cowlevel.net/element/${id}/article`;

    const response = await ofetch(`https://cowlevel.net/search/article-search?tag_id=${id}&game_url_slug=&per_page=10&page=1&q=&sort=&sort_type=desc&is_rich_content=1&url_slug=`, {
        headers: {
            Referer: url,
        },
    });

    const elementName = response.data.aggs.tags[0].tag.name;

    return {
        title: `奶牛关 - ${elementName}`,
        link: url,
        item: response.data.list.map((item) => ({
            title: item.title,
            author: item.user.name,
            description: item.content,
            pubDate: parseDate(item.update_time * 1000),
            link: `https://cowlevel.net/article/${item.id}`,
        })),
    };
}
