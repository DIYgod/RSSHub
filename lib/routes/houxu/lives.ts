// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const rootUrl = 'https://houxu.app';
    const apiUrl = `${rootUrl}/api/1/lives/${id}`;
    const currentUrl = `${rootUrl}/lives/${id}`;

    const pageResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    const response = await got({
        method: 'get',
        url: `${apiUrl}/threads?limit=${ctx.req.query('limit') ?? 500}`,
    });

    const items = response.data.results.map((item) => ({
        title: item.link.title,
        link: item.link.url,
        author: item.link.source ?? item.link.media.name,
        pubDate: parseDate(item.create_at),
        description: item.link.description,
    }));

    ctx.set('data', {
        title: `后续 - ${pageResponse.data.title}`,
        link: currentUrl,
        item: items,
        description: pageResponse.data.summary,
    });
};
