const axios = require('../../../utils/axios');

module.exports = async (ctx) => {
    const { keyword = '' } = ctx.params;
    const response = await axios({
        method: 'get',
        url: `https://36kr.com/pp/api/search/entity-search?page=1&per_page=20&sort=date&entity_type=post&keyword=${encodeURIComponent(keyword)}`,
    });

    const load = async (link) => {
        const response = await axios.get(link);
        const data = JSON.parse(response.data.match(/<script>window\.initialState=(.*)<\/script>/)[1]) || null;
        const description = data ? data.articleDetail.articleDetailData.data.content : '';
        return { description };
    };
    const items = await Promise.all(
        response.data.data.items.map(async (item) => {
            const link = `https://www.36kr.com/p/${item.id}`;
            const single = {
                title: item.title,
                link,
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
