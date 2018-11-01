const axios = require('../../../utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://q.qnmlgb.tech/w/api/articles?_ls=&_fmt=authorSimple&_page=author&_author_id=${id}&_sub_tab=&_tab=author`,
        headers: {
            Referer: `https://w.qnmlgb.tech/authors/${id}/`,
        },
    });
    const data = response.data.result.articles[0];

    ctx.state.data = {
        title: `${data.author.nickname}微信公众号`,
        link: `https://w.qnmlgb.tech/authors/${id}/`,
        description: data.author.profile_desc,
        item: data.sub_articles.map((item) => ({
            title: item.article.title,
            description: `${item.article.digest}<img referrerpolicy="no-referrer" src="${item.article.cover}">`,
            pubDate: new Date(item.article.datetime * 1000).toUTCString(),
            link: item.article.content_url,
        })),
    };
};
