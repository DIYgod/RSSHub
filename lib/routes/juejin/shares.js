const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.userId;

    const response = await got({
        method: 'get',
        url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_self?src=web&targetUid=${id}&type=article&order=createdAt`,
        headers: {
            Host: 'timeline-merger-ms.juejin.im',
            Origin: 'https://juejin.im',
            Referer: `https://juejin.im/user/${id}/shares`,
        },
    });
    const data = response.data.d.entrylist;
    const username = data[0] && data[0].user && data[0].user.username;
    const resultItems = await util.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title: `掘金分享-${username}`,
        link: `https://juejin.im/user/${id}/shares`,
        description: `掘金分享-${username}`,
        item: resultItems,
    };
};
