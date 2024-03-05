// @ts-nocheck
import got from '@/utils/got';
const { parseItem } = require('./utils');
const baseUrl = 'https://byteclicks.com';

export default async (ctx) => {
    const tag = ctx.req.param('tag');
    const { data: search } = await got(`${baseUrl}/wp-json/wp/v2/tags`, {
        searchParams: {
            search: tag,
            per_page: 100,
        },
    });
    const tagData = search.find((item) => item.name === tag);

    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
            tags: tagData.id,
        },
    });

    const items = parseItem(data);

    ctx.set('data', {
        title: `${tagData.name} - 字节点击`,
        image: 'https://byteclicks.com/wp-content/themes/RK-Blogger/images/wbolt.ico',
        link: tagData.link,
        item: items,
    });
};
