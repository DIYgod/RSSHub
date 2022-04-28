const got = require('@/utils/got');

module.exports = async (ctx) => {
    const api_url = 'https://sspai.com/api/v1/article/index/page/get?limit=10&offset=0&created_at=0';
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const items = await Promise.all(
        resp.data.data.map(async (item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`;
            let description = '';

            const key = `sspai: ${item.id}`;
            const value = await ctx.cache.get(key);

            if (value) {
                description = value;
            } else {
                const response = await got({ method: 'get', url: link });
                description = response.data.data.body;
                ctx.cache.set(key, description);
            }

            return {
                title: item.title.trim(),
                description,
                link,
                pubDate: new Date(item.released_at * 1000),
                author: item.author.nickname,
            };
        })
    );

    ctx.state.data = {
        title: '少数派 -- 首页',
        link: 'https://sspai.com',
        description: '少数派 -- 首页',
        item: items,
    };
};
