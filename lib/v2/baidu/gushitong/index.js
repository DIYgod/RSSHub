const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

const STATUS_MAP = {
    up: '上涨',
    down: '下跌',
};

module.exports = async (ctx) => {
    const response = await got('https://finance.pae.baidu.com/api/indexbanner?market=ab&finClientType=pc');
    const item = response.data.Result.map((e) => ({
        title: e.name,
        description: art(path.join(__dirname, '../templates/gushitong.art'), {
            ...e,
            status: STATUS_MAP[e.status],
            market: e.market.toUpperCase(),
        }),
        link: `https://gushitong.baidu.com/index/${e.market}-${e.code}`,
    }));
    ctx.state.data = {
        title: '百度股市通',
        description:
            '百度股市通，汇聚全球金融市场的股票、基金、外汇、期货等实时行情，7*24小时覆盖专业财经资讯，提供客观、准确、及时、全面的沪深港美上市公司股价、财务、股东、分红等信息，让用户在复杂的金融市场，更简单的获取投资信息。',
        link: 'https://gushitong.baidu.com/',
        item,
    };
};
