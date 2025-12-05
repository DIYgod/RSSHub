import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { channel = 'allrules/bussiness' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.szse.cn';
    const apiUrl = new URL('api/search/content', rootUrl).href;
    const currentUrl = new URL(`www/lawrules/rule/${channel}/`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const channelEl = $('ul.side-menu-con li.active').last();
    const channelCode = channelEl.prop('chnlcode');

    const { data: response } = await got.post(apiUrl, {
        form: {
            keyword: '',
            time: 0,
            range: 'title',
            'channelCode[]': channelCode,
            currentPage: 1,
            pageSize: limit,
            scope: 0,
        },
    });

    let items = response.data.slice(0, limit).map((item) => ({
        title: item.doctitle,
        pubDate: parseDate(item.docpubtime, 'X'),
        link: item.docpuburl,
        category: item.navigation,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h2.title').text();
                const description = $$('div#desContent').html();

                item.title = title;
                item.description = description;
                item.pubDate = item.pubDate ?? parseDate($$('div.time span').text());
                item.author = $$('meta[name="author"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div#desContent').text(),
                };
                item.language = $$('html').prop('lang');

                return item;
            })
        )
    );

    const image = $('a.navbar-brand img').prop('src');

    return {
        title: `深圳证券交易所 - ${channelEl.text()}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="author"]').prop('content'),
        language: $('html').prop('lang'),
    };
};

export const route: Route = {
    path: '/rule/:channel{.+}?',
    name: '本所业务规则',
    url: 'www.szse.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/szse/rule/allrules/bussiness',
    parameters: { channel: '频道，默认为 `allrules/bussiness`，即全部业务规则，可在对应频道页 URL 中找到' },
    description: `::: tip
  若订阅 [综合类](https://www.szse.cn/www/lawrules/rule/all/index.html)，网址为 \`https://www.szse.cn/www/lawrules/rule/all/index.html\`。截取 \`https://www.szse.cn/www/lawrules/rule/\` 到末尾 \`/index.html\` 的部分 \`all\` 作为参数填入，此时路由为 [\`/szse/rule/all\`](https://rsshub.app/szse/rule/all)。
:::

| 频道                                                                        | ID                                                    |
| --------------------------------------------------------------------------- | ----------------------------------------------------- |
| [综合类](https://www.szse.cn/www/lawrules/rule/all/index.html)              | [all](https://rsshub.app/szes/rule/all)               |
| [基础设施REITs类](https://www.szse.cn/www/lawrules/rule/reits/index.html)   | [reits](https://rsshub.app/szes/rule/reits)           |
| [衍生品类](https://www.szse.cn/www/lawrules/rule/derivative/index.html)     | [derivative](https://rsshub.app/szes/rule/derivative) |
| [会员管理类](https://www.szse.cn/www/lawrules/rule/memberty/index.html)     | [memberty](https://rsshub.app/szes/rule/memberty)     |
| [纪律处分与内部救济类](https://www.szse.cn/www/lawrules/rule/pr/index.html) | [pr](https://rsshub.app/szes/rule/pr)                 |

#### 股票类

| 频道                                                                                     | ID                                                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [发行上市审核](https://www.szse.cn/www/lawrules/rule/stock/audit/index.html)             | [stock/audit](https://rsshub.app/szes/rule/stock/audit)                               |
| [发行承销](https://www.szse.cn/www/lawrules/rule/stock/issue/index.html)                 | [stock/issue](https://rsshub.app/szes/rule/stock/issue)                               |
| [通用](https://www.szse.cn/www/lawrules/rule/stock/supervision/currency/index.html)      | [stock/supervision/currency](https://rsshub.app/szes/rule/stock/supervision/currency) |
| [主板专用](https://www.szse.cn/www/lawrules/rule/stock/supervision/mb/index.html)        | [stock/supervision/mb](https://rsshub.app/szes/rule/stock/supervision/mb)             |
| [创业板专用](https://www.szse.cn/www/lawrules/rule/stock/supervision/chinext/index.html) | [stock/supervision/chinext](https://rsshub.app/szes/rule/stock/supervision/chinext)   |
| [交易](https://www.szse.cn/www/lawrules/rule/stock/trade/index.html)                     | [stock/trade](https://rsshub.app/szes/rule/stock/trade)                               |

#### 固收类

| 频道                                                                                 | ID                                                                            |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [发行上市（挂牌）](https://www.szse.cn/www/lawrules/rule/bond/bonds/list/index.html) | [bond/bonds/list](https://rsshub.app/szes/rule/bond/bonds/list)               |
| [持续监管](https://www.szse.cn/www/lawrules/rule/bond/bonds/supervision/index.html)  | [bond/bonds/supervision](https://rsshub.app/szes/rule/bond/bonds/supervision) |
| [交易](https://www.szse.cn/www/lawrules/rule/bond/bonds/trade/index.html)            | [bond/bonds/trade](https://rsshub.app/szes/rule/bond/bonds/trade)             |
| [资产支持证券](https://www.szse.cn/www/lawrules/rule/bond/abs/index.html)            | [bond/abs](https://rsshub.app/szes/rule/bond/abs)                             |

#### 基金类

| 频道                                                                | ID                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| [上市](https://www.szse.cn/www/lawrules/rule/fund/list/index.html)  | [fund/list](https://rsshub.app/szes/rule/fund/list)   |
| [交易](https://www.szse.cn/www/lawrules/rule/fund/trade/index.html) | [fund/trade](https://rsshub.app/szes/rule/fund/trade) |

#### 交易类

| 频道                                                                                     | ID                                                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [通用](https://www.szse.cn/www/lawrules/rule/trade/current/index.html)                   | [trade/current](https://rsshub.app/szes/rule/trade/current)                           |
| [融资融券](https://www.szse.cn/www/lawrules/rule/trade/business/margin/index.html)       | [trade/business/margin](https://rsshub.app/szes/rule/trade/business/margin)           |
| [转融通](https://www.szse.cn/www/lawrules/rule/trade/business/refinancing/index.html)    | [trade/business/refinancing](https://rsshub.app/szes/rule/trade/business/refinancing) |
| [股票质押式回购](https://www.szse.cn/www/lawrules/rule/trade/business/pledge/index.html) | [trade/business/pledge](https://rsshub.app/szes/rule/trade/business/pledge)           |
| [质押式报价回购](https://www.szse.cn/www/lawrules/rule/trade/business/price/index.html)  | [trade/business/price](https://rsshub.app/szes/rule/trade/business/price)             |
| [约定购回](https://www.szse.cn/www/lawrules/rule/trade/business/promise/index.html)      | [trade/business/promise](https://rsshub.app/szes/rule/trade/business/promise)         |
| [协议转让](https://www.szse.cn/www/lawrules/rule/trade/business/transfer/index.html)     | [trade/business/transfer](https://rsshub.app/szes/rule/trade/business/transfer)       |
| [其他](https://www.szse.cn/www/lawrules/rule/trade/business/oth/index.html)              | [trade/business/oth](https://rsshub.app/szes/rule/trade/business/oth)                 |

#### 跨境创新类

| 频道                                                                          | ID                                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| [深港通](https://www.szse.cn/www/lawrules/rule/inno/szhk/index.html)          | [inno/szhk](https://rsshub.app/szes/rule/inno/szhk)   |
| [试点创新企业](https://www.szse.cn/www/lawrules/rule/inno/pilot/index.html)   | [inno/pilot](https://rsshub.app/szes/rule/inno/pilot) |
| [H股全流通](https://www.szse.cn/www/lawrules/rule/inno/hc/index.html)         | [inno/hc](https://rsshub.app/szes/rule/inno/hc)       |
| [互联互通存托凭证](https://www.szse.cn/www/lawrules/rule/inno/gdr/index.html) | [inno/gdr](https://rsshub.app/szes/rule/inno/gdr)     |

#### 全部规则

| 频道                                                                                | ID                                                                    |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [全部业务规则](https://www.szse.cn/www/lawrules/rule/allrules/bussiness/index.html) | [allrules/bussiness](https://rsshub.app/szes/rule/allrules/bussiness) |
| [规则汇编下载](https://www.szse.cn/www/lawrules/rule/allrules/rulejoin/index.html)  | [allrules/rulejoin](https://rsshub.app/szes/rule/allrules/rulejoin)   |

#### 已废止规则

| 频道                                                                                 | ID                                                                      |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [规则废止公告](https://www.szse.cn/www/lawrules/rule/repeal/announcement/index.html) | [repeal/announcement](https://rsshub.app/szes/rule/repeal/announcement) |
| [已废止规则文本](https://www.szse.cn/www/lawrules/rule/repeal/rules/index.html)      | [repeal/rules](https://rsshub.app/szes/rule/repeal/rules)               |
  `,
    categories: ['finance'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.szse.cn/www/lawrules/rule/:category'],
            target: (params) => {
                const category = params.category;

                return `/szse/rule${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '综合类',
            source: ['www.szse.cn/www/lawrules/rule/all/index.html'],
            target: '/rule/all',
        },
        {
            title: '基础设施REITs类',
            source: ['www.szse.cn/www/lawrules/rule/reits/index.html'],
            target: '/rule/reits',
        },
        {
            title: '衍生品类',
            source: ['www.szse.cn/www/lawrules/rule/derivative/index.html'],
            target: '/rule/derivative',
        },
        {
            title: '会员管理类',
            source: ['www.szse.cn/www/lawrules/rule/memberty/index.html'],
            target: '/rule/memberty',
        },
        {
            title: '纪律处分与内部救济类',
            source: ['www.szse.cn/www/lawrules/rule/pr/index.html'],
            target: '/rule/pr',
        },
        {
            title: '股票类 - 发行上市审核',
            source: ['www.szse.cn/www/lawrules/rule/stock/audit/index.html'],
            target: '/rule/stock/audit',
        },
        {
            title: '股票类 - 发行承销',
            source: ['www.szse.cn/www/lawrules/rule/stock/issue/index.html'],
            target: '/rule/stock/issue',
        },
        {
            title: '股票类 - 通用',
            source: ['www.szse.cn/www/lawrules/rule/stock/supervision/currency/index.html'],
            target: '/rule/stock/supervision/currency',
        },
        {
            title: '股票类 - 主板专用',
            source: ['www.szse.cn/www/lawrules/rule/stock/supervision/mb/index.html'],
            target: '/rule/stock/supervision/mb',
        },
        {
            title: '股票类 - 创业板专用',
            source: ['www.szse.cn/www/lawrules/rule/stock/supervision/chinext/index.html'],
            target: '/rule/stock/supervision/chinext',
        },
        {
            title: '股票类 - 交易',
            source: ['www.szse.cn/www/lawrules/rule/stock/trade/index.html'],
            target: '/rule/stock/trade',
        },
        {
            title: '固收类 - 发行上市（挂牌）',
            source: ['www.szse.cn/www/lawrules/rule/bond/bonds/list/index.html'],
            target: '/rule/bond/bonds/list',
        },
        {
            title: '固收类 - 持续监管',
            source: ['www.szse.cn/www/lawrules/rule/bond/bonds/supervision/index.html'],
            target: '/rule/bond/bonds/supervision',
        },
        {
            title: '固收类 - 交易',
            source: ['www.szse.cn/www/lawrules/rule/bond/bonds/trade/index.html'],
            target: '/rule/bond/bonds/trade',
        },
        {
            title: '固收类 - 资产支持证券',
            source: ['www.szse.cn/www/lawrules/rule/bond/abs/index.html'],
            target: '/rule/bond/abs',
        },
        {
            title: '基金类 - 上市',
            source: ['www.szse.cn/www/lawrules/rule/fund/list/index.html'],
            target: '/rule/fund/list',
        },
        {
            title: '基金类 - 交易',
            source: ['www.szse.cn/www/lawrules/rule/fund/trade/index.html'],
            target: '/rule/fund/trade',
        },
        {
            title: '交易类 - 通用',
            source: ['www.szse.cn/www/lawrules/rule/trade/current/index.html'],
            target: '/rule/trade/current',
        },
        {
            title: '交易类 - 融资融券',
            source: ['www.szse.cn/www/lawrules/rule/trade/business/margin/index.html'],
            target: '/rule/trade/business/margin',
        },
        {
            title: '交易类 - 转融通',
            source: ['www.szse.cn/www/lawrules/rule/trade/business/refinancing/index.html'],
            target: '/rule/trade/business/refinancing',
        },
        {
            title: '交易类 - 股票质押式回购',
            source: ['www.szse.cn/www/lawrules/rule/trade/business/pledge/index.html'],
            target: '/rule/trade/business/pledge',
        },
        {
            title: '交易类 - 质押式报价回购',
            source: ['www.szse.cn/www/lawrules/rule/trade/business/price/index.html'],
            target: '/rule/trade/business/price',
        },
        {
            title: '交易类 - 约定购回',
            source: ['www.szse.cn/www/lawrules/rule/trade/business/promise/index.html'],
            target: '/rule/trade/business/promise',
        },
        {
            title: '交易类 - 协议转让',
            source: ['www.szse.cn/www/lawrules/rule/trade/business/transfer/index.html'],
            target: '/rule/trade/business/transfer',
        },
        {
            title: '交易类 - 其他',
            source: ['www.szse.cn/www/lawrules/rule/trade/business/oth/index.html'],
            target: '/rule/trade/business/oth',
        },
        {
            title: '跨境创新类 - 深港通',
            source: ['www.szse.cn/www/lawrules/rule/inno/szhk/index.html'],
            target: '/rule/inno/szhk',
        },
        {
            title: '跨境创新类 - 试点创新企业',
            source: ['www.szse.cn/www/lawrules/rule/inno/pilot/index.html'],
            target: '/rule/inno/pilot',
        },
        {
            title: '跨境创新类 - H股全流通',
            source: ['www.szse.cn/www/lawrules/rule/inno/hc/index.html'],
            target: '/rule/inno/hc',
        },
        {
            title: '跨境创新类 - 互联互通存托凭证',
            source: ['www.szse.cn/www/lawrules/rule/inno/gdr/index.html'],
            target: '/rule/inno/gdr',
        },
        {
            title: '全部规则 - 全部业务规则',
            source: ['www.szse.cn/www/lawrules/rule/allrules/bussiness/index.html'],
            target: '/rule/allrules/bussiness',
        },
        {
            title: '全部规则 - 规则汇编下载',
            source: ['www.szse.cn/www/lawrules/rule/allrules/rulejoin/index.html'],
            target: '/rule/allrules/rulejoin',
        },
        {
            title: '已废止规则 - 规则废止公告',
            source: ['www.szse.cn/www/lawrules/rule/repeal/announcement/index.html'],
            target: '/rule/repeal/announcement',
        },
        {
            title: '已废止规则 - 已废止规则文本',
            source: ['www.szse.cn/www/lawrules/rule/repeal/rules/index.html'],
            target: '/rule/repeal/rules',
        },
    ],
};
