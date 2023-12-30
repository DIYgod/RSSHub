const got = require('@/utils/got');
const { processList, ProcessFeed, baseUrl, apiUrl } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${baseUrl}/user/@${id}`;
    const userData = await ctx.cache.tryGet(`vocus:user:${id}`, async () => {
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

    const items = await ProcessFeed(list, ctx.cache.tryGet);

    ctx.state.data = {
        title: `${userData.fullname}｜方格子 vocus`,
        link,
        description: userData.intro,
        image: userData.avatarUrl,
        item: items,
    };
};
