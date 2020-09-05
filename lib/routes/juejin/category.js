const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const { category } = ctx.params;

    const idResponse = await got({
        method: 'get',
        url: 'https://apinew.juejin.im/tag_api/v1/query_category_briefs?show_type=0',
    });

    const cat = idResponse.data.data.find((item) => item.category_url === category);
    const id = cat.category_id;

    const response = await got({
        method: 'post',
        url: 'https://apinew.juejin.im/recommend_api/v1/article/recommend_cate_feed',
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
        originalData = response.data.data.slice(0, 5);
    }
    const resultItems = await util.ProcessFeed(originalData, ctx.cache);

    ctx.state.data = {
        title: `掘金${cat.category_name}`,
        link: `https://juejin.im/${category}`,
        description: `掘金${cat.category_name}`,
        item: resultItems,
    };
};
