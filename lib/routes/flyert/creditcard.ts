import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import util from './utils';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
const host = 'https://www.flyert.com.cn';

export const route: Route = {
    path: '/creditcard/:bank',
    categories: ['travel'],
    example: '/flyert/creditcard/zhongxin',
    parameters: { bank: '信用卡板块各银行的拼音简称' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['flyert.com.cn/'],
        },
    ],
    name: '信用卡',
    maintainers: ['nicolaszf'],
    handler,
    url: 'flyert.com/',
    description: `| 信用卡模块 | bank          |
| ---------- | ------------- |
| 国内信用卡 | creditcard    |
| 浦发银行   | pufa          |
| 招商银行   | zhaoshang     |
| 中信银行   | zhongxin      |
| 交通银行   | jiaotong      |
| 中国银行   | zhonghang     |
| 工商银行   | gongshang     |
| 广发银行   | guangfa       |
| 农业银行   | nongye        |
| 建设银行   | jianshe       |
| 汇丰银行   | huifeng       |
| 民生银行   | mingsheng     |
| 兴业银行   | xingye        |
| 花旗银行   | huaqi         |
| 上海银行   | shanghai      |
| 无卡支付   | wuka          |
| 投资理财   | 137           |
| 网站权益汇 | 145           |
| 境外信用卡 | intcreditcard |`,
};

async function handler(ctx) {
    const bank = ctx.req.param('bank');
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
            break;
        default:
            throw new Error(`Unknown bank: ${bank}`);
    }

    const response = await got.get(target, {
        responseType: 'buffer',
    });

    const $ = load(gbk2utf8(response.data));

    const list = $("[id*='normalthread']").toArray();

    const result = await util.ProcessFeed(list, cache);

    return {
        title: `飞客茶馆信用卡 - ${bankname}`,
        link: 'https://www.flyert.com.cn/',
        description: `飞客茶馆信用卡 - ${bankname}`,
        item: result,
    };
}
