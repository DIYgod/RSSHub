const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://vocus.cc/user/@${id}`;

    const { _id, fullname, intro } = (await axios({
        method: 'get',
        url: `https://api.sosreader.com/api/users/${id}`,
        headers: {
            Referer: link,
        },
    })).data;

    const { articles } = (await axios({
        method: 'get',
        url: `https://api.sosreader.com/api/articles?userId=${_id}&num=10&status=2&sort=lastPublishAt`,
        headers: {
            Referer: link,
        },
    })).data;

    const items = await Promise.all(
        articles.map(async (item) => {
            const itemUrl = `https://api.sosreader.com/api/article/${item._id}`;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios({
                method: 'get',
                url: itemUrl,
                headers: {
                    Referer: link,
                },
            });

            const description = response.data.article.content;

            const single = {
                title: item.title,
                link: `https://vocus.cc/@${id}/${item._id}`,
                author: item.user.fullname,
                description: description,
                pubDate: new Date(item.updatedAt).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${fullname}的个人文章 - 方格子`,
        link: link,
        description: intro,
        item: items,
    };
};
