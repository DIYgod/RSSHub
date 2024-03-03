// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://bitmovin.com';

export default async (ctx) => {
    const apiUrl = `${baseUrl}/wp-json/wp/v2`;
    const { data } = await got(`${apiUrl}/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
        },
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        author: item.authors.map((a) => a.display_name).join(', '),
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        link: item.link,
    }));

    ctx.set('data', {
        title: 'Blog - Bitmovin',
        link: `${baseUrl}/blog/`,
        item: items,
    });
};
