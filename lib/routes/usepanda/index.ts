// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const feedId = ctx.req.param('id');
    const limit = ctx.req.query('limit') ?? 30; // 默认30条

    const rootUrl = 'https://api-panda.com/v4/';
    const apiUrl = `${rootUrl}articles?feeds=${feedId}&limit=${limit}&page=1&sort=popular`;

    const { data } = await got(apiUrl);

    const items = data.map((item) => ({
        title: `${item.title} 🌟 ${item.source.likesCount}`,
        author: item.source.username,
        pubDate: parseDate(item.source.createdAt),
        link: item.source.targetUrl,
        description: item.description,
    }));

    ctx.set('data', {
        title: 'Panda Feeds',
        link: 'https://usepanda.com/',
        item: items,
    });
};
