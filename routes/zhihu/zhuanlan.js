const axios = require('axios');
const art = require('art-template');
const path = require('path');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const listRes = await axios({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}/posts?limit=20`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://zhuanlan.zhihu.com/${id}`,
        }
    });
    const infoRes = await axios({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}`,
        headers: {
            'User-Agent': config.ua,
            'Referer': `https://zhuanlan.zhihu.com/${id}`,
        }
    });

    const list = listRes.data;
    const info = infoRes.data;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `知乎专栏-${info.name}`,
        link: `https://zhuanlan.zhihu.com/${id}`,
        description: info.description,
        lastBuildDate: new Date().toUTCString(),
        item: list.map((item) => {
                return {
                    title: item.title,
                    description: item.content,
                    pubDate: new Date(item.publishedTime).toUTCString(),
                    link: `https://zhuanlan.zhihu.com${item.url}`
            };
        }),
    });
};