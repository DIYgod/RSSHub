const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_self?src=web&targetUid=${id}&type=post&order=createdAt`,
        headers: {
            Host: 'timeline-merger-ms.juejin.im',
            Origin: 'https://juejin.im',
            Referer: `https://juejin.im/user/${id}/posts`
        },
    });
    const data = response.data.d.entrylist;
    const username = data && data[0] && data[0].user && data[0].user.username;
    ctx.state.data = {
        title: `掘金专栏-${username}`,
        link: `https://juejin.im/user/${id}/posts`,
        description: `掘金专栏-${username}`,
        item: data.map((item) => ({
            title: item.title,
            description: item.summaryInfo,
            pubDate: new Date(item.createdAt).toUTCString(),
            author: username,
            link: item.originalUrl,
        })),
    };
};
