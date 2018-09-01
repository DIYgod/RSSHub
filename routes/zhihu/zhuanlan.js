const axios = require('../../utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const listRes = await axios({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}/posts?limit=20`,
        headers: {
            ...utils.header,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });
    const infoRes = await axios({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}`,
        headers: {
            ...utils.header,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });

    if (listRes.status === 403) {
        throw 'list resource api returned status code ' + listRes.status;
    }

    if (infoRes.status === 403) {
        throw 'info resource api returned status code ' + infoRes.status;
    }

    const list = listRes.data;
    const info = infoRes.data;

    if (!Array.isArray(list)) {
        throw JSON.stringify(list);
    }

    ctx.state.data = {
        title: `知乎专栏-${info.name}`,
        link: `https://zhuanlan.zhihu.com/${id}`,
        description: info.description,
        item: list.map((item) => ({
            title: item.title,
            description: item.content.replace(/ src="/g, ' referrerpolicy="no-referrer" src="https://pic4.zhimg.com/'),
            pubDate: new Date(item.publishedTime).toUTCString(),
            link: `https://zhuanlan.zhihu.com${item.url}`,
        })),
    };
};
