const got = require('@/utils/got');

const getCateName = async (ctx, cid = 0) => {
    const key = 'eleduck-categories';
    const cates = await ctx.cache.tryGet(key, async () => {
        const res = await got(`https://svc.eleduck.com/api/v1/categories`);
        const map = {};
        res.data.categories.forEach((item) => {
            map[item.id] = item.name;
        });
        return map;
    });

    return cates[cid] || '全部';
};

module.exports = async (ctx) => {
    const cid = ctx.params.id || 0;

    const response = await got(`https://svc.eleduck.com/api/v1/posts?category=${cid}`);

    const { posts } = response.data;
    if (posts === undefined) {
        throw new Error('没有获取到数据');
    }

    const cname = await getCateName(ctx, cid);

    ctx.state.data = {
        title: `电鸭社区的文章--${cname}`,
        link: `https://eleduck.com/categories/${cid}`,
        description: `电鸭社区的文章,栏目为${cname}`,
        item: posts.map((item) => ({
            title: item.title,
            description: item.summary,
            pubDate: item.published_at,
            link: `https://eleduck.com/${item.category.id === 22 ? 'tposts' : 'posts'}/${item.id}`,
            author: item.user.nickname,
        })),
    };
};
