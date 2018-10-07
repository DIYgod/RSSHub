const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://xueqiu.com/S/F${ctx.params.id}`;

    let fundName = await axios({
        method: 'get',
        url,
        headers: {
            Referer: 'https://xueqiu.com/',
        },
    });

    const $ = cheerio.load(fundName.data);
    fundName = $('.stock-name').text();

    const response = await axios({
        method: 'get',
        url: `https://fund.xueqiu.com/dj/open/fund/growth/${ctx.params.id}?day=7`,
        headers: {
            Referer: url,
        },
    });

    const data = response.data.data.fund_nav_growth.pop();

    let description = `${fundName} 最新净值 ${data.nav} <br> 今日`;

    const value = parseFloat(data.value);

    if (value > 0) {
        description += '涨幅';
    } else if (value < 0) {
        description += '跌幅';
    } else if (value === 0) {
        description += '无波动';
    }

    description += ` ${data.value} ${data.percentage}%`;

    ctx.state.data = {
        title: fundName,
        link: url,
        description: `${fundName} 净值更新`,
        item: [
            {
                title: `${fundName} ${data.date} 净值更新`,
                description,
                pubDate: new Date(data.date).toUTCString(),
                link: url,
            },
        ],
    };
};
