const got = require('@/utils/got');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const cid = 12;
    const areaid = 2;

    const url = 'http://qt.qq.com/lua/lol_news/recommend_refresh?cid=' + cid + '&plat=ios&version=9880&areaid=' + areaid;
    const res = await got.get(url);
    const articles = (res.data || {}).update_list || [];
    const out = await Promise.all(
        articles.map(async (article) => {
            const link = article.article_url;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const guid = article.content_id;
            const title = article.title;
            const time = new Date(article.publication_date);
            time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);
            const pubDate = time.toUTCString();

            const description = '<img src="' + article.image_url_big + '">';

            const item = {
                title,
                description,
                pubDate,
                link,
                guid,
            };

            ctx.cache.set(link, JSON.stringify(item));

            return item;
        })
    );

    ctx.state.data = {
        title: '掌上英雄联盟 - 推荐',
        link: 'http://lol.qq.com/app/index.html',
        item: out,
    };
};
