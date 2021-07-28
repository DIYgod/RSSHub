const got = require('@/utils/got');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const url = 'https://news.maxjia.com/maxnews/app/list/';
    const res = await got.get(url);
    const articles = (res.data || {}).result || [];
    const out = await Promise.all(
        articles.map(async (article) => {
            const link = article.newUrl;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const guid = article.newsid;
            const title = article.title;
            const time = new Date(article.date);
            time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);
            const pubDate = time.toUTCString();

            const detailJsonLink = article.detail_json;
            const detailRes = await got.get(detailJsonLink);
            const description = detailRes.data.content;

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
        title: 'MaxNews - Dota 2',
        link: 'https://www.maxjia.com',
        item: out,
    };
};
