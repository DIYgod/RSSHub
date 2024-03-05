// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const util = require('./utils');

export default async (ctx) => {
    const userId = ctx.req.param('userId');
    const response = await got({
        method: 'get',
        url: `https://api.juejin.cn/interact_api/v1/collectionSet/list?user_id=${userId}&cursor=0&limit=20`,
    });

    // 获取用户所有收藏夹id
    const collectionId = response.data.data.map((item) => item.tag_id);

    // 获取所有收藏夹文章内容
    async function getPostId(item) {
        const collectPage = await got({
            method: 'get',
            url: `https://api.juejin.cn/interact_api/v1/collectionSet/get?tag_id=${item}&cursor=0`,
        });

        return (Array.isArray(collectPage.data.data.article_list) && collectPage.data.data.article_list.slice(0, 10)) || [];
    }

    const temp = await Promise.all(collectionId.map((element) => getPostId(element)));
    const posts = [];
    for (const item of temp) {
        posts.push(...item);
    }

    const result = await util.ProcessFeed(posts, cache);

    ctx.set('data', {
        title: '掘金 - 收藏集',
        link: `https://juejin.im/user/${userId}/collections`,
        description: '掘金，指定用户整个收藏集',
        item: result,
        allowEmpty: true,
    });
};
