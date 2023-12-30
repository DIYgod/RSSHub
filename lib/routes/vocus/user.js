const got = require('@/utils/got');
const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://vocus.cc/user/@${id}`;

    const { _id, fullname, intro } = (
        await got({
            method: 'get',
            url: `https://api.sosreader.com/api/users/${id}`,
            headers: {
                Referer: link,
            },
        })
    ).data;

    const { articles } = (
        await got({
            method: 'get',
            url: `https://api.sosreader.com/api/articles?userId=${_id}&num=10&status=2&sort=lastPublishAt`,
            headers: {
                Referer: link,
            },
        })
    ).data;

    const items = await ProcessFeed(articles, link, ctx.cache);

    ctx.state.data = {
        title: `${fullname}的个人文章 - 方格子`,
        link,
        description: intro,
        item: items,
    };
};
