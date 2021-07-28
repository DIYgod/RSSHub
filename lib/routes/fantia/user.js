const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://fantia.jp';
    const userUrl = `${rootUrl}/api/v1/fanclubs/${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: userUrl,
    });

    const list = response.data.fanclub.recent_posts.map((item) => ({
        title: item.title,
        link: `${rootUrl}/api/v1/posts/${item.id}`,
        description: `<p>${item.comment}</p>`,
        pubDate: new Date(item.posted_at).toUTCString(),
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const contentResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    item.link = item.link.replace('api/v1/', '');
                    item.description += `<img src="${contentResponse.data.post.thumb.large}">`;

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `Fantia - ${response.data.fanclub.fanclub_name_with_creator_name}`,
        link: `${rootUrl}/fanclubs/${ctx.params.id}`,
        item: items,
    };
};
