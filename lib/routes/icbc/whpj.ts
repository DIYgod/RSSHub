import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/whpj/:format?',
    categories: ['other'],
    example: '/icbc/whpj/zs?filter_title=%E8%8B%B1%E9%95%91',
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
            source: ['icbc.com.cn/column/1438058341489590354.html'],
            target: '/whpj',
        },
    ],
    name: '外汇牌价',
    maintainers: ['leoleoasd'],
    handler,
    url: 'icbc.com.cn/column/1438058341489590354.html',
    description: `| 短格式 | 参考价 | 现汇买卖 | 现钞买卖 | 现汇买入 | 现汇卖出 | 现钞买入 | 现钞卖出 |
| ------ | ------ | -------- | -------- | -------- | -------- | -------- | -------- |
| short  | zs     | xh       | xc       | xhmr     | xhmc     | xcmr     | xcmc     |`,
};

async function handler(ctx) {
    // yes, insecure
    // their openssl version isn't safe anyway (https://stackoverflow.com/questions/75763525/curl-35-error0a000152ssl-routinesunsafe-legacy-renegotiation-disabled)
    const { data } = await got('http://papi.icbc.com.cn/exchanges/ns/getLatest');
    const format = ctx.req.param('format');

    return {
        title: '中国工商银行外汇牌价',
        link: 'https://www.icbc.com.cn/column/1438058341489590354.html',
        item: data.data.map((item) => {
            const name = `${item.currencyCHName} ${item.currencyENName}`;

            const xhmr = `现汇买入价：${item.foreignBuy}`;

            const xcmr = `现钞买入价：${item.cashBuy}`;

            const xhmc = `现汇卖出价：${item.foreignSell}`;

            const xcmc = `现钞卖出价：${item.cashSell}`;

            const zs = `参考价：${item.reference}`;

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
                        return `${name} ${content}`;
                }
            };
            return {
                title: formatTitle(),
                pubDate: new Date(`${item.publishDate} ${item.publishTime}`),
                description: content.replaceAll(/\s/g, '<br>'),
                guid: `${name} ${item.publishDate} ${item.publishTime}`,
            };
        }),
    };
}
