const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const res1 = await axios({
        method: 'get',
        url: 'https://xueqiu.com/',
        header: {
            'User-Agent': config.ua,
        },
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await axios({
        method: 'get',
        url: 'https://xueqiu.com/favorites.json',
        params: {
            userid: id,
        },
        headers: {
            'User-Agent': config.ua,
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });
    const data = res2.data.list;

    ctx.state.data = {
        title: `ID: ${id} 的雪球收藏动态`,
        link: `https://xueqiu.com/u/${id}`,
        description: `ID: ${id} 的雪球收藏动态`,
        item: data.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: new Date(item.created_at).toUTCString(),
            link: `https://xueqiu.com${item.target}`,
        })),
    };
};
