const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const guid = `xueqiu/fund ${ctx.params.id}`;
    const cache = await ctx.cache.get(guid);

    if (cache) {
        return Promise.resolve(JSON.parse(cache));
    } else {
        const url = `https://xueqiu.com/S/F${ctx.params.id}`;

        let fundName = await got({
            method: 'get',
            url,
            headers: {
                Referer: 'https://xueqiu.com/',
            },
        });

        const $ = cheerio.load(fundName.data);
        fundName = $('.stock-name').text();
        const fundNameShort = fundName.slice(0, -10);

        const response = await got({
            method: 'get',
            url: `https://fund.xueqiu.com/dj/open/fund/growth/${ctx.params.id}?day=7`,
            headers: {
                Referer: url,
            },
        });

        const data = response.data.data.fund_nav_growth.pop();
        const yesterday = response.data.data.fund_nav_growth.pop();

        let description = `${fundNameShort} <br> 最新净值 ${data.nav} <br> 今日`;
        let title = `${fundNameShort} ${data.date.substring(5)} `;

        const value = (parseFloat(data.nav) - parseFloat(yesterday.nav)).toFixed(4);

        if (value > 0) {
            description += '涨幅';
            title += `📈 ${data.percentage}%`;
        } else if (value < 0) {
            description += '跌幅';
            title += `📉 ${data.percentage}%`;
        } else if (value === '0.0000') {
            description += '无波动';
            title += '持平';
        }

        description += ` ${data.percentage}%（¥${value}）`;

        const single = {
            title,
            description,
            pubDate: new Date().toUTCString(),
            guid: `${guid} ${data.date}`,
            link: url,
        };

        ctx.state.data = {
            title: fundName,
            link: url,
            description: `${fundName} 净值更新`,
            item: [single],
        };

        ctx.cache.set(guid, JSON.stringify(ctx.state.data));
    }
};
