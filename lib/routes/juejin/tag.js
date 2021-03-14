const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const { tag } = ctx.params;

    const idResponse = await got({
        method: 'post',
        url: 'https://api.juejin.cn/tag_api/v1/query_tag_detail',
        json: {
            key_word: tag,
        },
    });

    const id = idResponse.data.data.tag_id;

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_tag_feed',
        json: {
            id_type: 2,
            cursor: '0',
            tag_ids: [id],
            sort_type: 200,
        },
    });

    let originalData = [];
    if (response.data.data) {
        originalData = response.data.data.slice(0, 10);
    }
    const resultItems = await util.ProcessFeed(originalData, ctx.cache);

    ctx.state.data = {
        title: `掘金 ${tag}`,
        link: `https://juejin.cn/tag/${encodeURIComponent(tag)}`,
        description: `掘金 ${tag}`,
        item: resultItems,
    };
};
