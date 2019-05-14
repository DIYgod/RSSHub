const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.boc.cn/sourcedb/whpj/';
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

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
            const content = `现汇买入价：${$(this)
                .find('td:nth-child(2)')
                .text()} 现钞买入价：${$(this)
                .find('td:nth-child(3)')
                .text()} 现汇卖出价：${$(this)
                .find('td:nth-child(4)')
                .text()} 现钞卖出价：${$(this)
                .find('td:nth-child(5)')
                .text()} 中行折算价：${$(this)
                .find('td:nth-child(6)')
                .text()}`;
            const info = {
                title: name + ' ' + content,
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
