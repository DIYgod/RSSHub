const got = require('@/utils/got');

async function getArticleContentByID(ctx, id) {
    const link = `http://i.mittrchina.com/information/details?id=${id}`;

    const cache = ctx.cache.get(link);
    if (cache) {
        return cache;
    }

    const response = await got(link);
    ctx.cache.set(link, response.data.data.content);
    return response.data.data.content;
}

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = `http://i.mittrchina.com/information/${type}?limit=10`;
    const response = await got(link);

    let articles, title;
    if (type === 'hot') {
        articles = response.data.data;
        title = '本周热榜';
    } else {
        articles = response.data.data.items;
        title = '首页资讯';
    }

    ctx.state.data = {
        title: `MIT 科技评论 - ${title}`,
        link: 'http://www.mittrchina.com/',
        item: await Promise.all(
            articles.map(async (article) => ({
                title: article.name,
                author: article.authors.map((author) => author.username).join(', '),
                category: article.typeName,
                description: await getArticleContentByID(ctx, article.id),
                pubDate: new Date(article.start_time * 1000),
                guid: article.id,
                link: `http://www.mittrchina.com/news/detail/${article.id}`,
            }))
        ),
    };
};
