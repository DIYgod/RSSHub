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
        url: 'https://xueqiu.com/v4/stock/portfolio/stocks.json?size=10000&type=1&pid=-1&category=2',
        params: {
            uid: id,
        },
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });
    const data = res2.data.stocks;

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
            title: `@${screen_name} 关注了股票 ${item.stockName}`,
            description: `@${screen_name} 在${new Date(item.createAt).toLocaleString()} 关注了 ${item.stockName}(${item.exchange}:${item.code})。`,
            pubDate: new Date(item.createAt).toUTCString(),
            link: `https://xueqiu.com/s/${item.code}`,
        })),
    };
};
