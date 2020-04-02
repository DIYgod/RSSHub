const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.boc.cn/sourcedb/whpj/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const format = ctx.params.format;

    const en_names = {
        阿联酋迪拉姆: 'AED',
        澳大利亚元: 'AUD',
        巴西里亚尔: 'BRL',
        加拿大元: 'CAD',
        瑞士法郎: 'CHF',
        丹麦克朗: 'DKK',
        欧元: 'EUR',
        英镑: 'GBP',
        港币: 'HKD',
        印尼卢比: 'IDR',
        印度卢比: 'INR',
        日元: 'JPY',
        韩国元: 'KRW',
        澳门元: 'MOP',
        林吉特: 'MYR',
        挪威克朗: 'NOK',
        新西兰元: 'NZD',
        菲律宾比索: 'PHP',
        卢布: 'RUB',
        沙特里亚尔: 'SAR',
        瑞典克朗: 'SEK',
        新加坡元: 'SGD',
        泰国铢: 'THB',
        土耳其里拉: 'TRY',
        新台币: 'TWD',
        美元: 'USD',
        南非兰特: 'ZAR',
    };

    const out = $('div.publish table tbody tr')
        .slice(2)
        .map(function () {
            const zh_name = $(this).find('td:nth-child(1)').text();
            const en_name = en_names[zh_name] || '';
            const name = `${zh_name} ${en_name} `;
            const date = `${$(this).find('td:nth-child(7)').text()} ${$(this).find('td:nth-child(8)').text()}`;

            const xhmr = `现汇买入价：${$(this).find('td:nth-child(2)').text()}`;

            const xcmr = `现钞买入价：${$(this).find('td:nth-child(3)').text()}`;

            const xhmc = `现汇卖出价：${$(this).find('td:nth-child(4)').text()}`;

            const xcmc = `现钞卖出价：${$(this).find('td:nth-child(5)').text()}`;

            const zs = `中行折算价：${$(this).find('td:nth-child(6)').text()}`;

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
