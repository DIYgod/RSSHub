// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    if (!isValidHost(id)) {
        throw new Error('Invalid id');
    }

    const response = await got({
        method: 'get',
        url: `https://${id}.zhubai.love/api/publications/${id}/posts?publication_id_type=token&limit=${limit}`,
        headers: {
            Referer: `https://${id}.zhubai.love/`,
        },
    });
    const data = response.data.data;
    const { name, description } = data[0].publication;

    ctx.set('data', {
        title: name,
        link: `https://${id}.zhubai.love/`,
        description,
        item: data.map((item) => ({
            title: item.title,
            pubDate: parseDate(item.created_at),
            link: `https://${id}.zhubai.love/posts/${item.id}`,
            author: name,
        })),
    });
};
