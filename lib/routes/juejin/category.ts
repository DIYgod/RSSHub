// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const util = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category');

    const idResponse = await got({
        method: 'get',
        url: 'https://api.juejin.cn/tag_api/v1/query_category_briefs?show_type=0',
    });

    const cat = idResponse.data.data.find((item) => item.category_url === category);
    const id = cat.category_id;

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed',
        json: {
            id_type: 2,
            sort_type: 300,
            cate_id: id,
            cursor: '0',
            limit: 20,
        },
    });

    let originalData = [];
    if (response.data.data) {
        originalData = response.data.data;
    }
    const resultItems = await util.ProcessFeed(originalData, cache);

    ctx.set('data', {
        title: `掘金 ${cat.category_name}`,
        link: `https://juejin.cn/${category}`,
        description: `掘金 ${cat.category_name}`,
        item: resultItems,
    });
};
