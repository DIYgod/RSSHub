// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { processList, ProcessFeed, baseUrl, apiUrl } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const link = `${baseUrl}/${id}/home`;

    const publicationData = await cache.tryGet(`vocus:publication:${id}`, async () => {
        const { data: publicationData } = await got(`${apiUrl}/api/publication/${id}`, {
            headers: {
                referer: link,
            },
        });
        return {
            _id: publicationData._id,
            title: publicationData.title,
            abstract: publicationData.abstract,
        };
    });

    const {
        data: { articles },
    } = await got(`${apiUrl}/api/articles`, {
        headers: {
            referer: link,
        },
        searchParams: {
            publicationId: publicationData._id,
        },
    });

    const list = processList(articles);

    const items = await ProcessFeed(list, cache.tryGet);

    ctx.set('data', {
        title: `${publicationData.title} - 文章列表｜方格子 vocus`,
        link,
        description: publicationData.abstract,
        item: items,
    });
};
