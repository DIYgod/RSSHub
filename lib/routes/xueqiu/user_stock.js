const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const res1 = await axios({
        method: 'get',
        url: 'https://xueqiu.com/',
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await axios({
        method: 'get',
        url: 'https://stock.xueqiu.com/v5/stock/portfolio/stock/list.json?category=1&size=1000',
        params: {
            uid: id,
        },
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });
    const data = res2.data.data.stocks;

    const res3 = await axios({
        method: 'get',
        url: 'https://xueqiu.com/statuses/original/show.json',
        params: {
            user_id: id,
        },
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });
    const screen_name = res3.data.user.screen_name;

    ctx.state.data = {
        title: `${screen_name} 的雪球自选动态`,
        link: `https://xueqiu.com/u/${id}`,
        description: `@${screen_name} 的雪球自选动态`,
        item: data.map((item) => ({
            title: `@${screen_name} 关注了股票 ${item.name}`,
            description: `@${screen_name} 在${new Date(item.created).toLocaleString()} 关注了 ${item.name}(${item.exchange}:${item.symbol})。`,
            pubDate: new Date(item.created).toUTCString(),
            link: `https://xueqiu.com/s/${item.symbol}`,
        })),
    };
};
