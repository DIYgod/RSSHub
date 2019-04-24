const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const { _id, title, abstract } = (await axios.get(`https://api.sosreader.com/api/publication/${id}`)).data;
    const { articles } = (await axios.get(`https://api.sosreader.com/api/articles?publicationId=${_id}&status=2&num=10&page=1`)).data;
    const items = await Promise.all(
        articles.map(async (item) => ({
            title: item.title,
            author: item.user.fullname,
            description: (await axios.get(`https://api.sosreader.com/api/article/${item._id}`)).data.article.content,
            pubDate: new Date(item.updatedAt).toUTCString(),
            link: `https://vocus.cc/${id}/${item._id}`,
        }))
    );

    ctx.state.data = {
        title: `${title} - 方格子`,
        link: `https://vocus.cc/${id}/home`,
        description: abstract,
        item: items,
    };
};
