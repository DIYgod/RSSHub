const got = require('@/utils/got');
const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://vocus.cc/${id}/home`;
    const configs = { headers: { Referer: link } };

    const { _id, title, abstract } = (await got.get(`https://api.sosreader.com/api/publication/${id}`, configs)).data;
    const { articles } = (await got.get(`https://api.sosreader.com/api/articles?publicationId=${_id}&status=2&num=10&page=1`, configs)).data;
    const items = await ProcessFeed(articles, `https://vocus.cc/${id}`, ctx.cache);

    ctx.state.data = {
        title: `${title} - 方格子`,
        link,
        description: abstract,
        item: items,
    };
};
