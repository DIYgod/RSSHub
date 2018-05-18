const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const listRes = await axios({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}/posts?limit=20`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });
    const infoRes = await axios({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });

    const list = listRes.data;
    const info = infoRes.data;

    ctx.state.data = {
        title: `知乎专栏-${info.name}`,
        link: `https://zhuanlan.zhihu.com/${id}`,
        description: info.description,
        item: list.map((item) => ({
            title: item.title,
            description: item.content.replace(/<img src="/g, '<img referrerpolicy="no-referrer" src="https://pic4.zhimg.com/'),
            pubDate: new Date(item.publishedTime).toUTCString(),
            link: `https://zhuanlan.zhihu.com${item.url}`,
        })),
    };
};
