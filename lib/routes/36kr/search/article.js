const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const { keyword = '' } = ctx.params;
    const response = await axios({
        method: 'get',
        url: `https://36kr.com/pp/api/search/entity-search?page=1&per_page=20&sort=date&entity_type=post&keyword=${encodeURIComponent(keyword)}`,
    });

    const load = async (link) => {
        const response = await axios.get(link);
        const description = response.data.data.content;
        return { description };
    };
    const items = await Promise.all(
        response.data.data.items.map(async (item) => {
            const link = `https://36kr.com/api/post/${item.id}`;
            const single = {
                title: item.title,
                link: `https://www.36kr.com/p/${item.id}`,
                pubDate: new Date(item.published_at).toUTCString(),
            };

            const other = await ctx.cache.tryGet(link, async () => await load(link));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: `36kr - ${keyword}`,
        link: `https://www.36kr.com/search/articles/${encodeURIComponent(keyword)}`,
        item: items,
    };
};
