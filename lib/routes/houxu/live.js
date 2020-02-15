const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const baseUrl = 'https://houxu.app';
    const baseInfoApi = `${baseUrl}/api/1/lives/${id}`;
    const { desc, title } = await ctx.cache.tryGet(baseInfoApi, async () => {
        const res = await got.get(baseInfoApi);
        const { summary: desc, title } = res.data;
        return {
            title,
            desc,
        };
    });

    const itemsRes = await got(`${baseUrl}/api/1/lives/${id}/threads`, {
        searchParams: {
            limit: 40,
        },
    });

    const item = itemsRes.data.results.map((i) => {
        const { media, url, title, description, publish_at } = i.link;
        return {
            title,
            description: `${description}<br/><img src="${media.avatar_url}" />`,
            link: url,
            pubDate: new Date(publish_at).toUTCString(),
            author: media.name,
        };
    });

    ctx.state.data = {
        title,
        description: desc,
        link: `${baseUrl}/lives/${id}`,
        item,
    };
};
