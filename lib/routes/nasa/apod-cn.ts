// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;
    const rootUrl = `https://www.nasachina.cn/wp-json/wp/v2/posts?categories=2&per_page=${limit}`;
    const { data } = await got({
        method: 'get',
        url: rootUrl,
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        link: item.link,
    }));

    ctx.set('data', {
        title: 'NASA中文 - 天文·每日一图',
        link: 'https://www.nasachina.cn/nasa-image-of-the-day',
        item: items,
    });
};
