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
    const fundNameShort = fundName.slice(0, -10);

    const response = await axios({
        method: 'get',
        url: `https://fund.xueqiu.com/dj/open/fund/growth/${ctx.params.id}?day=7`,
        headers: {
            Referer: url,
        },
    });

    const data = response.data.data.fund_nav_growth.pop();

    let description = `${fundNameShort} <br> 最新净值 ${data.nav} <br> 今日`;
    let title = `${fundNameShort} ${data.date.substring(5)} `;

    const value = parseFloat(data.value);

    if (value > 0) {
        description += '涨幅';
        title += `📈 ${data.percentage}%`;
    } else if (value < 0) {
        description += '跌幅';
        title += `📉 ${data.percentage}%`;
    } else if (value === 0) {
        description += '无波动';
        title += '持平';
    }

    description += ` ${data.percentage}%
    （¥${data.value}）`;

    ctx.state.data = {
        title: fundName,
        link: url,
        description: `${fundName} 净值更新`,
        item: [
            {
                title,
                description,
                pubDate: new Date(data.date).toUTCString(),
                link: url,
            },
        ],
    };
};
