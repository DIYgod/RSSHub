const got = require('@/utils/got');

module.exports = async (ctx) => {
    const api_url = `https://sspai.com/api/v1/topics?offset=0&limit=20&include_total=false`;
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;
    const items = await Promise.all(
        data.map(async (item) => {
            const link = `https://sspai.com/topic/${item.id}`;
            let description = '';

            const key = `sspai: ${item.id}`;
            const value = await ctx.cache.get(key);

            if (value) {
                description = value;
            } else {
                description = `${item.intro}<br><img src="https://cdn.sspai.com/${item.banner}" /><br>如有兴趣,请复制链接订阅 <br> <h3>https://rsshub.app/sspai/topic/${item.id}</h3>`;
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
        title: `少数派专题广场更新推送`,
        link: `https://sspai.com/topics`,
        description: `仅仅推送新的专题(集合型而非具体文章) `,
        item: items,
    };
};
