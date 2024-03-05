// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { processList, ProcessFeed, baseUrl, apiUrl } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const link = `${baseUrl}/user/@${id}`;
    const userData = await cache.tryGet(`vocus:user:${id}`, async () => {
        const { data: userData } = await got(`${apiUrl}/api/users/${id}`, {
            headers: {
                referer: link,
            },
        });
        return {
            _id: userData._id,
            fullname: userData.fullname,
            avatarUrl: userData.avatarUrl,
            intro: userData.intro,
        };
    });

    const {
        data: { articles },
    } = await got(`${apiUrl}/api/articles`, {
        headers: {
            referer: link,
        },
        searchParams: {
            userId: userData._id,
        },
    });

    const list = processList(articles);

    const items = await ProcessFeed(list, cache.tryGet);

    ctx.set('data', {
        title: `${userData.fullname}｜方格子 vocus`,
        link,
        description: userData.intro,
        image: userData.avatarUrl,
        item: items,
    });
};
