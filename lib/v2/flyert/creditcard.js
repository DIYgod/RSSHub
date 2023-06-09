const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');
const iconv = require('iconv-lite');

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
const host = 'https://www.flyert.com';

module.exports = async (ctx) => {
    const bank = ctx.params.bank;
    const target = `${host}/forum-${bank}-1.html`;
    let bankname = '';

    switch (bank) {
        case 'creditcard':
            bankname = '国内信用卡';
            break;
        case 'pufa':
            bankname = '浦发银行';
            break;
        case 'zhaoshang':
            bankname = '招商银行';
            break;
        case 'zhongxin':
            bankname = '中信银行';
            break;
        case 'jiaotong':
            bankname = '交通银行';
            break;
        case 'zhonghang':
            bankname = '中国银行';
            break;
        case 'gongshang':
            bankname = '工商银行';
            break;
        case 'guangfa':
            bankname = '广发银行';
            break;
        case 'nongye':
            bankname = '农业银行';
            break;
        case 'jianshe':
            bankname = '建设银行';
            break;
        case 'huifeng':
            bankname = '汇丰银行';
            break;
        case 'mingsheng':
            bankname = '民生银行';
            break;
        case 'xingye':
            bankname = '兴业银行';
            break;
        case 'huaqi':
            bankname = '花旗银行';
            break;
        case 'shanghai':
            bankname = '上海银行';
            break;
        case 'wuka':
            bankname = '无卡支付';
            break;
        case '137':
            bankname = '投资理财';
            break;
        case '145':
            bankname = '网站权益汇';
            break;
        case 'intcreditcard':
            bankname = '境外信用卡';
    }

    const response = await got.get(target, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(gbk2utf8(response.data));

    const list = $("[id*='normalthread']").get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `飞客茶馆信用卡 - ${bankname}`,
        link: 'https://www.flyert.com/',
        description: `飞客茶馆信用卡 - ${bankname}`,
        item: result,
    };
};
