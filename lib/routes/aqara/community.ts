// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '';
    const keyword = ctx.req.param('keyword') ?? '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const rootUrl = 'https://community.aqara.com';
    const apiUrl = `${rootUrl}/api/v2/feeds?limit=${limit}&platedetail_id=${id}&keyword=${keyword}&all=1`;
    const currentUrl = `${rootUrl}/pc/#/post${id ? `?id=${id}` : ''}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.feed_title,
        link: `${rootUrl}/pc/#/post/postDetail/${item.id}`,
        description: item.feed_content,
        pubDate: parseDate(item.created_at),
        author: item.user.nickname,
    }));

    ctx.set('data', {
        title: 'Aqara社区',
        link: currentUrl,
        item: items,
        allowEmpty: true,
    });
};
