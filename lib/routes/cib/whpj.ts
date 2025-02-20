import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import https from 'https';
import crypto from 'crypto';
import { config } from '@/config';

export const route: Route = {
    path: '/whpj/:format?',
    categories: ['other'],
    example: '/cib/whpj/xh?filter_title=USD',
    parameters: { format: '输出的标题格式，默认为标题 + 所有价格。短格式仅包含货币名称。' },
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
            source: ['cib.com.cn/'],
            target: '/whpj',
        },
    ],
    name: '外汇牌价',
    maintainers: ['Qixingchen'],
    handler,
    url: 'cib.com.cn/',
    description: `| 短格式 | 现汇买卖 | 现钞买卖 | 现汇买入 | 现汇卖出 | 现钞买入 | 现钞卖出 |
| ------ | -------- | -------- | -------- | -------- | -------- | -------- |
| short  | xh       | xc       | xhmr     | xhmc     | xcmr     | xcmc     |`,
};

async function handler(ctx) {
    // fix unsafe legacy renegotiation disabled
    const agent = new https.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    });

    const response = await got('https://personalbank.cib.com.cn/pers/main/pubinfo/ifxQuotationQuery.do', { agent: { https: agent } });
    const cookies = response.headers['set-cookie'].map((item) => item.split(';')[0]).join(';');

    const $ = load(response.data);
    let date = $('div.main-body').find('div.labe_text').text();
    date = date.split('\n\t')[1].replace('日期：', '').trim();
    date = date.substring(0, 11) + date.substring(15);

    const link = 'https://personalbank.cib.com.cn/pers/main/pubinfo/ifxQuotationQuery/list?_search=false&dataSet.rows=80&dataSet.page=1&dataSet.sidx=&dataSet.sord=asc';
    const data = await cache.tryGet(
        link,
        async () => {
            const detailResponse = await got(link, {
                headers: {
                    Cookie: cookies,
                },
                agent: { https: agent },
            });
            return detailResponse.data;
        },
        config.cache.contentExpire,
        false
    );

    const format = ctx.req.param('format');

    return {
        title: '中国兴业银行外汇牌价',
        link: 'https://personalbank.cib.com.cn/pers/main/pubinfo/ifxQuotationQuery.do',
        item: data.rows.map((item) => {
            const name = `${item.cell[0]} ${item.cell[1]}`;

            const xhmr = `现汇买入价：${item.cell[3]}`;

            const xcmr = `现钞买入价：${item.cell[5]}`;

            const xhmc = `现汇卖出价：${item.cell[4]}`;

            const xcmc = `现钞卖出价：${item.cell[6]}`;

            const content = `${xhmr} ${xcmr} ${xhmc} ${xcmc}`;

            return {
                title: formatTitle(name, xhmr, xcmr, xhmc, xcmc, content, format),
                pubDate: parseDate(date, 'YYYY年MM月DD日 HH:mm:ss'),
                description: content.replaceAll(/\s/g, '<br>'),
                guid: `${item.cell[0]} ${item.cell[1]} ${date}`,
            };
        }),
    };
}

function formatTitle(name, xhmr, xcmr, xhmc, xcmc, content, format) {
    switch (format) {
        case 'short':
            return name;
        case 'xh':
            return `${name} ${xhmr} ${xhmc}`;
        case 'xc':
            return `${name} ${xcmr} ${xcmc}`;
        case 'xhmr':
            return `${name} ${xhmr}`;
        case 'xhmc':
            return `${name} ${xhmc}`;
        case 'xcmr':
            return `${name} ${xcmr}`;
        case 'xcmc':
            return `${name} ${xcmc}`;
        default:
            return `${name} ${content}`;
    }
}
