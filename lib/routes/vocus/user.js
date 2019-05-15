const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const { _id, fullname, intro } = (await axios.get(`https://api.sosreader.com/api/users/${id}`)).data;
    const { articles } = (await axios.get(`https://api.sosreader.com/api/articles?userId=${_id}&num=10&status=2&sort=lastPublishAt`)).data;
    const items = await Promise.all(
        articles.map(async (item) => ({
            title: item.title,
            author: item.user.fullname,
            description: (await axios.get(`https://api.sosreader.com/api/article/${item._id}`)).data.article.content,
            pubDate: new Date(item.updatedAt).toUTCString(),
            link: `https://vocus.cc/@${id}/${item._id}`,
        }))
    );

    ctx.state.data = {
        title: `${fullname}的个人文章 - 方格子`,
        link: `https://vocus.cc/user/@${id}`,
        description: intro,
        item: items,
    };
};
