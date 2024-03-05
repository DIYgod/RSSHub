// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const util = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/content_api/v1/article/query_list',
        json: {
            user_id: id,
            sort_type: 2,
        },
    });
    const { data } = response.data;
    const username = data[0] && data[0].author_user_info && data[0].author_user_info.user_name;
    const resultItems = await util.ProcessFeed(data, cache);

    ctx.set('data', {
        title: `掘金专栏-${username}`,
        link: `https://juejin.cn/user/${id}/posts`,
        description: `掘金专栏-${username}`,
        item: resultItems,
    });
};
