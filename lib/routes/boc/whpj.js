const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.boc.cn/sourcedb/whpj/';
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const format = ctx.params.format;

    const out = $('div.publish table tbody tr')
        .slice(2)
        .map(function() {
            const name = $(this)
                .find('td:nth-child(1)')
                .text();
            const date = `${$(this)
                .find('td:nth-child(7)')
                .text()} ${$(this)
                .find('td:nth-child(8)')
                .text()}`;

            const xhmr = `现汇买入价：${$(this)
                .find('td:nth-child(2)')
                .text()}`;

            const xcmr = `现钞买入价：${$(this)
                .find('td:nth-child(3)')
                .text()}`;

            const xhmc = `现汇卖出价：${$(this)
                .find('td:nth-child(4)')
                .text()}`;

            const xcmc = `现钞卖出价：${$(this)
                .find('td:nth-child(5)')
                .text()}`;

            const zs = `中行折算价：${$(this)
                .find('td:nth-child(6)')
                .text()}`;

            const content = `${xhmr} ${xcmr} ${xhmc} ${xcmc} ${zs}`;

            const formatTitle = () => {
                switch (format) {
                    case 'short':
                        return name;
                    case 'xh':
                        return `${name} ${xhmr} ${xhmc}`;
                    case 'xc':
                        return `${name} ${xcmr} ${xcmc}`;
                    case 'zs':
                        return `${name} ${zs}`;
                    case 'xhmr':
                        return `${name} ${xhmr}`;
                    case 'xhmc':
                        return `${name} ${xhmc}`;
                    case 'xcmr':
                        return `${name} ${xcmr}`;
                    case 'xcmc':
                        return `${name} ${xcmc}`;
                    default:
                        return name + content;
                }
            };

            const info = {
                title: formatTitle(),
                description: content.replace(/\s/g, '<br>'),
                pubDate: new Date(date).toUTCString(),
                guid: name + date,
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: '中国银行外汇牌价',
        link: link,
        item: out,
    };
};
