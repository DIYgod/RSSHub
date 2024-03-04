// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const getCateName = async (cid = 0) => {
    const key = 'eleduck-categories';
    const cates = await cache.tryGet(key, async () => {
        const res = await got(`https://svc.eleduck.com/api/v1/categories`);
        const map = {};
        for (const item of res.data.categories) {
            map[item.id] = item.name;
        }
        return map;
    });

    return cates[cid] || '全部';
};

export default async (ctx) => {
    const cid = ctx.req.param('id') || 0;

    const response = await got(`https://svc.eleduck.com/api/v1/posts?category=${cid}&sort=-published_at&page=1`);

    const { posts } = response.data;
    if (posts === undefined) {
        throw new Error('没有获取到数据');
    }

    const cname = await getCateName(cid);

    ctx.set('data', {
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
    });
};
