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
    const rawData = response.data.result.articles;

    const data = [];

    for (let i = 0; i < rawData.length; i++) {
        const subArticles = rawData[i].sub_articles;
        for (let j = 0; j < subArticles.length; j++) {
            data.push(subArticles[j]);
        }
    }

    ctx.state.data = {
        title: `${rawData[0].author.nickname}微信公众号`,
        link: `https://w.qnmlgb.tech/authors/${id}/`,
        description: rawData[0].author.profile_desc,
        item: data.map((item) => ({
            title: item.article.title,
            description: `${item.article.digest}<img referrerpolicy="no-referrer" src="${item.article.cover}">`,
            pubDate: new Date(item.article.datetime * 1000).toUTCString(),
            link: item.article.content_url,
        })),
    };
};
