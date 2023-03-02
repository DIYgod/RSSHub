const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/content_api/v1/news/list_user',
        json: {
            user_id: id,
            sort_type: 2,
        },
    });
    const { data } = response.data;
    const username = data[0] && data[0].author_user_info && data[0].author_user_info.user_name;
    const resultItems = await util.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title: `掘金资讯-${username}`,
        link: `https://juejin.cn/user/${id}/news`,
        description: `掘金资讯-${username}`,
        item: resultItems,
    };
};
