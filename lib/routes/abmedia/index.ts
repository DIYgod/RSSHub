// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.abmedia.io';
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

export default async (ctx) => {
    const limit = ctx.req.param('limit') ?? 10;
    const url = `${postsAPIUrl}?per_page=${limit}`;

    const response = await got.get(url);
    const data = response.data;

    const items = data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: parseDate(item.date),
    }));

    ctx.set('data', {
        title: 'ABMedia - 最新消息',
        link: rootUrl,
        item: items,
    });
};
