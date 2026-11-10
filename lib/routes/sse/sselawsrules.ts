import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

export const handler = async (ctx) => {
    const { category = 'latest' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.sse.com.cn';
    const currentUrl = new URL(category.startsWith('/lawandrules/') ? category : `lawandrules/sselawsrules2025/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const listItems = $('div#sse_list_1 dl dd');
    let items: DataItem[] = listItems
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.find('a').attr('title') ?? $item.find('a').text(),
                pubDate: parseDateInTimezone($item.find('span').text().trim(), 8),
                link: new URL($item.find('a').prop('href')!, rootUrl).href,
            };
        });

    if (!listItems.length) {
        items = $('#sourceHtml')
            .text()
            .split('@doc@')
            .flatMap((record): DataItem[] => {
                const [, date, href, title] = record.split('@memo@').map((field) => field.trim());
                if (!date || !href || !title) {
                    return [];
                }
                return [{ title, pubDate: parseDateInTimezone(date, 8), link: new URL(href.startsWith('/sse/') ? href.slice(4) : href, rootUrl).href }];
            })
            .slice(0, limit);
    }

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`sse:rules:body:v2:${item.link}`, async () => {
                const { data: detailResponse } = await got(item.link);
                const $$ = load(detailResponse);
                const description = $$('div.allZoom').html();
                return {
                    description,
                    author: $$('meta[name="author"]').prop('content'),
                    content: {
                        html: description,
                        text: $$('div.allZoom').text(),
                    },
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    const imagePath = $('img.sse_logo').attr('src');
    const image = imagePath ? new URL(imagePath, rootUrl).href : undefined;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author: $('meta[name="author"]').prop('content'),
    };
};

export const route: Route = {
    path: '/sselawsrules/:category{.+}?',
    name: '本所业务规则',
    url: 'www.sse.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/sse/sselawsrules/latest',
    parameters: { category: '分类，默认为最新规则，即 `latest`，可在对应分类页 URL 中找到' },
    description: `::: tip
若订阅 [最新规则](https://www.sse.com.cn/lawandrules/sselawsrules2025/latest/)，网址为 \`https://www.sse.com.cn/lawandrules/sselawsrules2025/latest/\`。截取 \`https://www.sse.com.cn/lawandrules/sselawsrules2025/\` 到末尾 \`/\` 的部分 \`latest\` 作为参数填入，此时路由为 [\`/sse/sselawsrules/latest\`](https://rsshub.app/sse/sselawsrules/latest)。
:::

| [最新规则](https://www.sse.com.cn/lawandrules/sselawsrules2025/latest/) | [章程](https://www.sse.com.cn/lawandrules/sselawsrules2025/article/) | [首发](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/firstepisode/)      | [再融资](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/refinancing/)   | [重组](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/recombination/)       |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [latest](https://rsshub.app/sse/sselawsrules/latest)                    | [article](https://rsshub.app/sse/sselawsrules/article)               | [stocks/review/firstepisode](https://rsshub.app/sse/sselawsrules/stocks/review/firstepisode) | [stocks/review/refinancing](https://rsshub.app/sse/sselawsrules/stocks/review/refinancing) | [stocks/review/recombination](https://rsshub.app/sse/sselawsrules/stocks/review/recombination) |

| [转板](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/flap/) | [发行承销](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/issue/) | [主板上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/mainipo/) | [科创板上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/staripo/) | [股票交易](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/exchange/) |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [stocks/review/flap](https://rsshub.app/sse/sselawsrules/stocks/review/flap)    | [stocks/issue](https://rsshub.app/sse/sselawsrules/stocks/issue)              | [stocks/mainipo](https://rsshub.app/sse/sselawsrules/stocks/mainipo)                    | [stocks/staripo](https://rsshub.app/sse/sselawsrules/stocks/staripo)                      | [stocks/exchange](https://rsshub.app/sse/sselawsrules/stocks/exchange)           |

| [试点创新企业](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/innovative/) | [股权分置改革](https://www.sse.com.cn/lawandrules/sselawsrules2025/stocks/reform/) | [发行上市审核](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/review/) | [发行承销](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/issue/) | [公司债券上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/listing/corporatebond/) |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [stocks/innovative](https://rsshub.app/sse/sselawsrules/stocks/innovative)             | [stocks/reform](https://rsshub.app/sse/sselawsrules/stocks/reform)                 | [bond/review](https://rsshub.app/sse/sselawsrules/bond/review)                   | [bond/issue](https://rsshub.app/sse/sselawsrules/bond/issue)                | [bond/listing/corporatebond](https://rsshub.app/sse/sselawsrules/bond/listing/corporatebond)            |

| [资产支持证券上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/listing/assets/) | [债券交易通用](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/currency/) | [国债预发行](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/tbondp/) | [债券质押式三方回购](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/tripartyrepo/) | [债券质押式协议回购](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/repurchase/) |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [bond/listing/assets](https://rsshub.app/sse/sselawsrules/bond/listing/assets)                       | [bond/trading/currency](https://rsshub.app/sse/sselawsrules/bond/trading/currency)         | [bond/trading/tbondp](https://rsshub.app/sse/sselawsrules/bond/trading/tbondp)         | [bond/trading/tripartyrepo](https://rsshub.app/sse/sselawsrules/bond/trading/tripartyrepo)           | [bond/trading/repurchase](https://rsshub.app/sse/sselawsrules/bond/trading/repurchase)             |

| [国债买断式回购交易](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/outrightrepo/) | [信用保护工具](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/cdx/) | [上市公司可转债](https://www.sse.com.cn/lawandrules/sselawsrules2025/bond/convertible/) | [基金上市](https://www.sse.com.cn/lawandrules/sselawsrules2025/fund/listing/) | [基金交易](https://www.sse.com.cn/lawandrules/sselawsrules2025/fund/trading/) |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [bond/trading/outrightrepo](https://rsshub.app/sse/sselawsrules/bond/trading/outrightrepo)           | [bond/trading/cdx](https://rsshub.app/sse/sselawsrules/bond/trading/cdx)              | [bond/convertible](https://rsshub.app/sse/sselawsrules/bond/convertible)                | [fund/listing](https://rsshub.app/sse/sselawsrules/fund/listing)              | [fund/trading](https://rsshub.app/sse/sselawsrules/fund/trading)              |

| [基础设施公募 REITs](https://www.sse.com.cn/lawandrules/sselawsrules2025/reits/) | [期权](https://www.sse.com.cn/lawandrules/sselawsrules2025/option/) | [通用类](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/universal/) | [融资融券](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/) | [转融通](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/refinancing/)    |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [reits](https://rsshub.app/sse/sselawsrules/reits)                               | [option](https://rsshub.app/sse/sselawsrules/option)                | [trade/universal](https://rsshub.app/sse/sselawsrules/trade/universal)         | [trade/specific/margin](https://rsshub.app/sse/sselawsrules/trade/specific/margin)     | [trade/specific/refinancing](https://rsshub.app/sse/sselawsrules/trade/specific/refinancing) |

| [质押式回购](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/repo/) | [质押式报价回购](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/pricerepo/) | [约定购回](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/promise/) | [协议转让](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/xyzr/) | [其他](https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/others/) |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [trade/specific/repo](https://rsshub.app/sse/sselawsrules/trade/specific/repo)         | [trade/specific/pricerepo](https://rsshub.app/sse/sselawsrules/trade/specific/pricerepo)        | [trade/specific/promise](https://rsshub.app/sse/sselawsrules/trade/specific/promise)    | [trade/specific/xyzr](https://rsshub.app/sse/sselawsrules/trade/specific/xyzr)       | [trade/specific/others](https://rsshub.app/sse/sselawsrules/trade/specific/others) |

| [沪港通](https://www.sse.com.cn/lawandrules/sselawsrules2025/global/hkexsc/) | [互联互通存托凭证](https://www.sse.com.cn/lawandrules/sselawsrules2025/global/slsc/) | [会员管理](https://www.sse.com.cn/lawandrules/sselawsrules2025/member/personnel/) | [适当性管理](https://www.sse.com.cn/lawandrules/sselawsrules2025/member/adequacy/) | [纪律处分与复核](https://www.sse.com.cn/lawandrules/sselawsrules2025/disciplinary/) |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [global/hkexsc](https://rsshub.app/sse/sselawsrules/global/hkexsc)           | [global/slsc](https://rsshub.app/sse/sselawsrules/global/slsc)                       | [member/personnel](https://rsshub.app/sse/sselawsrules/member/personnel)          | [member/adequacy](https://rsshub.app/sse/sselawsrules/member/adequacy)             | [disciplinary](https://rsshub.app/sse/sselawsrules/disciplinary)                    |

| [交易收费](https://www.sse.com.cn/lawandrules/sselawsrules2025/charge/) | [其他业务规则](https://www.sse.com.cn/lawandrules/sselawsrules2025/other/) | [业务规则废止公告](https://www.sse.com.cn/lawandrules/sselawsrules2025/repeal/announcement/) | [已废止规则文本](https://www.sse.com.cn/lawandrules/sselawsrules2025/repeal/rules/) |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [charge](https://rsshub.app/sse/sselawsrules/charge)                    | [other](https://rsshub.app/sse/sselawsrules/other)                         | [repeal/announcement](https://rsshub.app/sse/sselawsrules/repeal/announcement)               | [repeal/rules](https://rsshub.app/sse/sselawsrules/repeal/rules)                    |`,
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
            title: '最新规则',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/latest/'],
            target: '/sselawsrules/latest',
        },
        {
            title: '章程',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/article/'],
            target: '/sselawsrules/article',
        },
        {
            title: '首发',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/firstepisode/'],
            target: '/sselawsrules/stocks/review/firstepisode',
        },
        {
            title: '再融资',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/refinancing/'],
            target: '/sselawsrules/stocks/review/refinancing',
        },
        {
            title: '重组',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/recombination/'],
            target: '/sselawsrules/stocks/review/recombination',
        },
        {
            title: '转板',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/review/flap/'],
            target: '/sselawsrules/stocks/review/flap',
        },
        {
            title: '发行承销',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/issue/'],
            target: '/sselawsrules/stocks/issue',
        },
        {
            title: '主板上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/mainipo/'],
            target: '/sselawsrules/stocks/mainipo',
        },
        {
            title: '科创板上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/staripo/'],
            target: '/sselawsrules/stocks/staripo',
        },
        {
            title: '股票交易',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/exchange/'],
            target: '/sselawsrules/stocks/exchange',
        },
        {
            title: '试点创新企业',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/innovative/'],
            target: '/sselawsrules/stocks/innovative',
        },
        {
            title: '股权分置改革',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/stocks/reform/'],
            target: '/sselawsrules/stocks/reform',
        },
        {
            title: '发行上市审核',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/review/'],
            target: '/sselawsrules/bond/review',
        },
        {
            title: '发行承销',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/issue/'],
            target: '/sselawsrules/bond/issue',
        },
        {
            title: '公司债券上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/listing/corporatebond/'],
            target: '/sselawsrules/bond/listing/corporatebond',
        },
        {
            title: '资产支持证券上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/listing/assets/'],
            target: '/sselawsrules/bond/listing/assets',
        },
        {
            title: '债券交易通用',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/currency/'],
            target: '/sselawsrules/bond/trading/currency',
        },
        {
            title: '国债预发行',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/tbondp/'],
            target: '/sselawsrules/bond/trading/tbondp',
        },
        {
            title: '债券质押式三方回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/tripartyrepo/'],
            target: '/sselawsrules/bond/trading/tripartyrepo',
        },
        {
            title: '债券质押式协议回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/repurchase/'],
            target: '/sselawsrules/bond/trading/repurchase',
        },
        {
            title: '国债买断式回购交易',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/outrightrepo/'],
            target: '/sselawsrules/bond/trading/outrightrepo',
        },
        {
            title: '信用保护工具',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/trading/cdx/'],
            target: '/sselawsrules/bond/trading/cdx',
        },
        {
            title: '上市公司可转债',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/bond/convertible/'],
            target: '/sselawsrules/bond/convertible',
        },
        {
            title: '基金上市',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/fund/listing/'],
            target: '/sselawsrules/fund/listing',
        },
        {
            title: '基金交易',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/fund/trading/'],
            target: '/sselawsrules/fund/trading',
        },
        {
            title: '基础设施公募REITs',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/reits/'],
            target: '/sselawsrules/reits',
        },
        {
            title: '期权',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/option/'],
            target: '/sselawsrules/option',
        },
        {
            title: '通用类',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/universal/'],
            target: '/sselawsrules/trade/universal',
        },
        {
            title: '融资融券',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/'],
            target: '/sselawsrules/trade/specific/margin',
        },
        {
            title: '转融通',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/refinancing/'],
            target: '/sselawsrules/trade/specific/refinancing',
        },
        {
            title: '质押式回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/repo/'],
            target: '/sselawsrules/trade/specific/repo',
        },
        {
            title: '质押式报价回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/pricerepo/'],
            target: '/sselawsrules/trade/specific/pricerepo',
        },
        {
            title: '约定购回',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/promise/'],
            target: '/sselawsrules/trade/specific/promise',
        },
        {
            title: '协议转让',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/xyzr/'],
            target: '/sselawsrules/trade/specific/xyzr',
        },
        {
            title: '其他',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/others/'],
            target: '/sselawsrules/trade/specific/others',
        },
        {
            title: '沪港通',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/global/hkexsc/'],
            target: '/sselawsrules/global/hkexsc',
        },
        {
            title: '互联互通存托凭证',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/global/slsc/'],
            target: '/sselawsrules/global/slsc',
        },
        {
            title: '会员管理',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/member/personnel/'],
            target: '/sselawsrules/member/personnel',
        },
        {
            title: '适当性管理',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/member/adequacy/'],
            target: '/sselawsrules/member/adequacy',
        },
        {
            title: '纪律处分与复核',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/disciplinary/'],
            target: '/sselawsrules/disciplinary',
        },
        {
            title: '交易收费',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/charge/'],
            target: '/sselawsrules/charge',
        },
        {
            title: '其他业务规则',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/other/'],
            target: '/sselawsrules/other',
        },
        {
            title: '业务规则废止公告',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/repeal/announcement/'],
            target: '/sselawsrules/repeal/announcement',
        },
        {
            title: '已废止规则文本',
            source: ['www.sse.com.cn/lawandrules/sselawsrules2025/repeal/rules/'],
            target: '/sselawsrules/repeal/rules',
        },
    ],
};
