const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'https://m.whalegogo.com/index';
    const response = await got.get('https://api.whalegogo.com/v1/app/index');

    const list = response.data.items;
    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.push_at;
            const id = info.id;
            const cid = info.cid;
            const author = info.author.username;

            const itemUrl = `https://m.whalegogo.com/article?id=${id}&cid=${cid}`;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(`https://api.whalegogo.com/v1/articles/${id}?expand=content`);
            const description = response.data.content;

            const single = {
                title: title,
                author,
                link: itemUrl,
                description: description,
                pubDate: new Date(date * 1000).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '鲸跃汽车',
        link: url,
        item: out,
    };
};
