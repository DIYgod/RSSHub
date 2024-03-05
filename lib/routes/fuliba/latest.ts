// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { data: response } = await got(`https://fuliba2023.net/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ?? 100,
            _embed: 1,
        },
    });
    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        guid: item.guid.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        author: item._embedded.author[0].name,
    }));

    ctx.set('data', {
        title: '福利吧',
        link: `https://fuliba2023.net`,
        item: items,
    });
};
