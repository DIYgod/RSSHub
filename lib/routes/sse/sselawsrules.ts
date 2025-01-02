import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'latest' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.sse.com.cn';
    const currentUrl = new URL(`lawandrules/sselawsrules/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div#sse_list_1 dl dd')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').text().trim(),
                pubDate: parseDate(item.find('span').text().trim()),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.article-infor h2').text().trim();
                const description = $$('div.allZoom').html();

                item.title = title;
                item.description = description;
                item.pubDate = parseDate($$('div.article_opt i').text().trim());
                item.author = $$('meta[name="author"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div.allZoom').text(),
                };
                item.updated = $$('meta[name="others"]').prop('content')
                    ? timezone(
                          parseDate(
                              $$('meta[name="others"]')
                                  .prop('content')
                                  .split(/时间\s/)
                                  .pop()
                          ),
                          +8
                      )
                    : undefined;

                return item;
            })
        )
    );

    const image = new URL($('img.sse_logo').prop('content'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
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
  若订阅 [最新规则](https://www.sse.com.cn/lawandrules/sselawsrules/latest/)，网址为 \`https://www.sse.com.cn/lawandrules/sselawsrules/latest/\`。截取 \`https://www.sse.com.cn/lawandrules/sselawsrules/\` 到末尾 \`/\` 的部分 \`latest\` 作为参数填入，此时路由为 [\`/sse/sselawsrules/latest\`](https://rsshub.app/sse/sselawsrules/latest)。
:::

  | [最新规则](https://www.sse.com.cn/lawandrules/sselawsrules/latest/) | [章程](https://www.sse.com.cn/lawandrules/sselawsrules/article/) | [首发](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/review/firstepisode/)          | [再融资](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/review/refinancing/)       | [重组](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/review/recombination/)           |
  | ------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
  | [latest](https://rsshub.app/sse/sselawsrules/latest)                | [article](https://rsshub.app/sse/sselawsrules/article)           | [stocks/review/firstepisode](https://rsshub.app/sse/sselawsrules/stocks/review/firstepisode) | [stocks/review/refinancing](https://rsshub.app/sse/sselawsrules/stocks/review/refinancing) | [stocks/review/recombination](https://rsshub.app/sse/sselawsrules/stocks/review/recombination) |

  | [转板](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/review/flap/)  | [发行承销](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/issue/) | [主板上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/mainipo/) | [科创板上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/staripo/) | [股票交易](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/exchange/) |
  | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
  | [stocks/review/flap](https://rsshub.app/sse/sselawsrules/stocks/review/flap) | [stocks/issue](https://rsshub.app/sse/sselawsrules/stocks/issue)          | [stocks/mainipo](https://rsshub.app/sse/sselawsrules/stocks/mainipo)                | [stocks/staripo](https://rsshub.app/sse/sselawsrules/stocks/staripo)                  | [stocks/exchange](https://rsshub.app/sse/sselawsrules/stocks/exchange)       |

  | [试点创新企业](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/innovative/) | [股权分置改革](https://www.sse.com.cn/lawandrules/sselawsrules/stocks/reform/) | [发行上市审核](https://www.sse.com.cn/lawandrules/sselawsrules/bond/review/) | [发行承销](https://www.sse.com.cn/lawandrules/sselawsrules/bond/issue/) | [公司债券上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules/bond/listing/corporatebond/) |
  | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
  | [stocks/innovative](https://rsshub.app/sse/sselawsrules/stocks/innovative)         | [stocks/reform](https://rsshub.app/sse/sselawsrules/stocks/reform)             | [bond/review](https://rsshub.app/sse/sselawsrules/bond/review)               | [bond/issue](https://rsshub.app/sse/sselawsrules/bond/issue)            | [bond/listing/corporatebond](https://rsshub.app/sse/sselawsrules/bond/listing/corporatebond)        |

  | [资产支持证券上市（挂牌）](https://www.sse.com.cn/lawandrules/sselawsrules/bond/listing/assets/) | [债券交易通用](https://www.sse.com.cn/lawandrules/sselawsrules/bond/trading/currency/) | [国债预发行](https://www.sse.com.cn/lawandrules/sselawsrules/bond/trading/tbondp/) | [债券质押式三方回购](https://www.sse.com.cn/lawandrules/sselawsrules/bond/trading/tripartyrepo/) | [债券质押式协议回购](https://www.sse.com.cn/lawandrules/sselawsrules/bond/trading/repurchase/) |
  | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
  | [bond/listing/assets](https://rsshub.app/sse/sselawsrules/bond/listing/assets)                   | [bond/trading/currency](https://rsshub.app/sse/sselawsrules/bond/trading/currency)     | [bond/trading/tbondp](https://rsshub.app/sse/sselawsrules/bond/trading/tbondp)     | [bond/trading/tripartyrepo](https://rsshub.app/sse/sselawsrules/bond/trading/tripartyrepo)       | [bond/trading/repurchase](https://rsshub.app/sse/sselawsrules/bond/trading/repurchase)         |

  | [国债买断式回购交易](https://www.sse.com.cn/lawandrules/sselawsrules/bond/trading/outrightrepo/) | [信用保护工具](https://www.sse.com.cn/lawandrules/sselawsrules/bond/trading/cdx/) | [上市公司可转债](https://www.sse.com.cn/lawandrules/sselawsrules/bond/convertible/) | [基金上市](https://www.sse.com.cn/lawandrules/sselawsrules/fund/listing/) | [基金交易](https://www.sse.com.cn/lawandrules/sselawsrules/fund/trading/) |
  | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
  | [bond/trading/outrightrepo](https://rsshub.app/sse/sselawsrules/bond/trading/outrightrepo)       | [bond/trading/cdx](https://rsshub.app/sse/sselawsrules/bond/trading/cdx)          | [bond/convertible](https://rsshub.app/sse/sselawsrules/bond/convertible)            | [fund/listing](https://rsshub.app/sse/sselawsrules/fund/listing)          | [fund/trading](https://rsshub.app/sse/sselawsrules/fund/trading)          |

  | [基础设施公募REITs](https://www.sse.com.cn/lawandrules/sselawsrules/reits/) | [期权](https://www.sse.com.cn/lawandrules/sselawsrules/option/) | [通用类](https://www.sse.com.cn/lawandrules/sselawsrules/trade/universal/) | [融资融券](https://www.sse.com.cn/lawandrules/sselawsrules/trade/specific/margin/) | [转融通](https://www.sse.com.cn/lawandrules/sselawsrules/trade/specific/refinancing/)        |
  | --------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
  | [reits](https://rsshub.app/sse/sselawsrules/reits)                          | [option](https://rsshub.app/sse/sselawsrules/option)            | [trade/universal](https://rsshub.app/sse/sselawsrules/trade/universal)     | [trade/specific/margin](https://rsshub.app/sse/sselawsrules/trade/specific/margin) | [trade/specific/refinancing](https://rsshub.app/sse/sselawsrules/trade/specific/refinancing) |

  | [质押式回购](https://www.sse.com.cn/lawandrules/sselawsrules/trade/specific/repo/) | [质押式报价回购](https://www.sse.com.cn/lawandrules/sselawsrules/trade/specific/pricerepo/) | [约定购回](https://www.sse.com.cn/lawandrules/sselawsrules/trade/specific/promise/)  | [协议转让](https://www.sse.com.cn/lawandrules/sselawsrules/trade/specific/xyzr/) | [其他](https://www.sse.com.cn/lawandrules/sselawsrules/trade/specific/others/)     |
  | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
  | [trade/specific/repo](https://rsshub.app/sse/sselawsrules/trade/specific/repo)     | [trade/specific/pricerepo](https://rsshub.app/sse/sselawsrules/trade/specific/pricerepo)    | [trade/specific/promise](https://rsshub.app/sse/sselawsrules/trade/specific/promise) | [trade/specific/xyzr](https://rsshub.app/sse/sselawsrules/trade/specific/xyzr)   | [trade/specific/others](https://rsshub.app/sse/sselawsrules/trade/specific/others) |

  | [沪港通](https://www.sse.com.cn/lawandrules/sselawsrules/global/hkexsc/) | [互联互通存托凭证](https://www.sse.com.cn/lawandrules/sselawsrules/global/slsc/) | [会员管理](https://www.sse.com.cn/lawandrules/sselawsrules/member/personnel/) | [适当性管理](https://www.sse.com.cn/lawandrules/sselawsrules/member/adequacy/) | [纪律处分与复核](https://www.sse.com.cn/lawandrules/sselawsrules/disciplinary/) |
  | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
  | [global/hkexsc](https://rsshub.app/sse/sselawsrules/global/hkexsc)       | [global/slsc](https://rsshub.app/sse/sselawsrules/global/slsc)                   | [member/personnel](https://rsshub.app/sse/sselawsrules/member/personnel)      | [member/adequacy](https://rsshub.app/sse/sselawsrules/member/adequacy)         | [disciplinary](https://rsshub.app/sse/sselawsrules/disciplinary)                |

  | [交易收费](https://www.sse.com.cn/lawandrules/sselawsrules/charge/) | [其他业务规则](https://www.sse.com.cn/lawandrules/sselawsrules/other/) | [业务规则废止公告](https://www.sse.com.cn/lawandrules/sserules/repeal/announcement/)                                       | [已废止规则文本](https://www.sse.com.cn/lawandrules/sselawsrules/repeal/rules/) |
  | ------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
  | [charge](https://rsshub.app/sse/sselawsrules/charge)                | [other](https://rsshub.app/sse/sselawsrules/other)                     | [/lawandrules/sserules/repeal/announcement](https://rsshub.app/sse/sselawsrules//lawandrules/sserules/repeal/announcement) | [repeal/rules](https://rsshub.app/sse/sselawsrules/repeal/rules)                |
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
            source: ['www.sse.com.cn/lawandrules/sselawsrules/:category'],
            target: (params) => {
                const category = params.category;

                return `/sse/sselawsrules${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '最新规则',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/latest/'],
            target: '/sselawsrules/latest',
        },
        {
            title: '章程',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/article/'],
            target: '/sselawsrules/article',
        },
        {
            title: '首发',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/review/firstepisode/'],
            target: '/sselawsrules/stocks/review/firstepisode',
        },
        {
            title: '再融资',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/review/refinancing/'],
            target: '/sselawsrules/stocks/review/refinancing',
        },
        {
            title: '重组',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/review/recombination/'],
            target: '/sselawsrules/stocks/review/recombination',
        },
        {
            title: '转板',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/review/flap/'],
            target: '/sselawsrules/stocks/review/flap',
        },
        {
            title: '发行承销',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/issue/'],
            target: '/sselawsrules/stocks/issue',
        },
        {
            title: '主板上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/mainipo/'],
            target: '/sselawsrules/stocks/mainipo',
        },
        {
            title: '科创板上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/staripo/'],
            target: '/sselawsrules/stocks/staripo',
        },
        {
            title: '股票交易',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/exchange/'],
            target: '/sselawsrules/stocks/exchange',
        },
        {
            title: '试点创新企业',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/innovative/'],
            target: '/sselawsrules/stocks/innovative',
        },
        {
            title: '股权分置改革',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/stocks/reform/'],
            target: '/sselawsrules/stocks/reform',
        },
        {
            title: '发行上市审核',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/review/'],
            target: '/sselawsrules/bond/review',
        },
        {
            title: '发行承销',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/issue/'],
            target: '/sselawsrules/bond/issue',
        },
        {
            title: '公司债券上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/listing/corporatebond/'],
            target: '/sselawsrules/bond/listing/corporatebond',
        },
        {
            title: '资产支持证券上市（挂牌）',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/listing/assets/'],
            target: '/sselawsrules/bond/listing/assets',
        },
        {
            title: '债券交易通用',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/trading/currency/'],
            target: '/sselawsrules/bond/trading/currency',
        },
        {
            title: '国债预发行',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/trading/tbondp/'],
            target: '/sselawsrules/bond/trading/tbondp',
        },
        {
            title: '债券质押式三方回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/trading/tripartyrepo/'],
            target: '/sselawsrules/bond/trading/tripartyrepo',
        },
        {
            title: '债券质押式协议回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/trading/repurchase/'],
            target: '/sselawsrules/bond/trading/repurchase',
        },
        {
            title: '国债买断式回购交易',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/trading/outrightrepo/'],
            target: '/sselawsrules/bond/trading/outrightrepo',
        },
        {
            title: '信用保护工具',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/trading/cdx/'],
            target: '/sselawsrules/bond/trading/cdx',
        },
        {
            title: '上市公司可转债',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/bond/convertible/'],
            target: '/sselawsrules/bond/convertible',
        },
        {
            title: '基金上市',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/fund/listing/'],
            target: '/sselawsrules/fund/listing',
        },
        {
            title: '基金交易',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/fund/trading/'],
            target: '/sselawsrules/fund/trading',
        },
        {
            title: '基础设施公募REITs',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/reits/'],
            target: '/sselawsrules/reits',
        },
        {
            title: '期权',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/option/'],
            target: '/sselawsrules/option',
        },
        {
            title: '通用类',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/universal/'],
            target: '/sselawsrules/trade/universal',
        },
        {
            title: '融资融券',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/specific/margin/'],
            target: '/sselawsrules/trade/specific/margin',
        },
        {
            title: '转融通',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/specific/refinancing/'],
            target: '/sselawsrules/trade/specific/refinancing',
        },
        {
            title: '质押式回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/specific/repo/'],
            target: '/sselawsrules/trade/specific/repo',
        },
        {
            title: '质押式报价回购',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/specific/pricerepo/'],
            target: '/sselawsrules/trade/specific/pricerepo',
        },
        {
            title: '约定购回',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/specific/promise/'],
            target: '/sselawsrules/trade/specific/promise',
        },
        {
            title: '协议转让',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/specific/xyzr/'],
            target: '/sselawsrules/trade/specific/xyzr',
        },
        {
            title: '其他',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/trade/specific/others/'],
            target: '/sselawsrules/trade/specific/others',
        },
        {
            title: '沪港通',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/global/hkexsc/'],
            target: '/sselawsrules/global/hkexsc',
        },
        {
            title: '互联互通存托凭证',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/global/slsc/'],
            target: '/sselawsrules/global/slsc',
        },
        {
            title: '会员管理',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/member/personnel/'],
            target: '/sselawsrules/member/personnel',
        },
        {
            title: '适当性管理',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/member/adequacy/'],
            target: '/sselawsrules/member/adequacy',
        },
        {
            title: '纪律处分与复核',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/disciplinary/'],
            target: '/sselawsrules/disciplinary',
        },
        {
            title: '交易收费',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/charge/'],
            target: '/sselawsrules/charge',
        },
        {
            title: '其他业务规则',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/other/'],
            target: '/sselawsrules/other',
        },
        {
            title: '业务规则废止公告',
            source: ['www.sse.com.cn/lawandrules/sserules/repeal/announcement/'],
            target: '/sselawsrules//lawandrules/sserules/repeal/announcement',
        },
        {
            title: '已废止规则文本',
            source: ['www.sse.com.cn/lawandrules/sselawsrules/repeal/rules/'],
            target: '/sselawsrules/repeal/rules',
        },
    ],
};
