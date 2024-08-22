import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'html/xinwen/index' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25;

    const rootUrl = 'https://www.lswz.gov.cn';
    const currentUrl = new URL(`${category}.shtml`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul.lists li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').text(),
                pubDate: parseDate(item.find('span').text()),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                $$('ul.lists').remove();
                $$('div.pub-right-source, div.detail_links_pane').remove();

                const title = $$('meta[name="ArticleTitle"]').prop('content') || $$('div.pub-det-title').text();
                const description = $$('table.pages_content, div.article-content, div.TRS_UEDITOR, div.TRS_PreAppend').html();
                const pubDate = $$('meta[name="PubDate"]').prop('content');

                item.title = title || item.title;
                item.description = description;
                item.pubDate = pubDate ? timezone(parseDate(pubDate), +8) : item.pubDate;
                item.author = $$('meta[name="ContentSource"]').prop('content')?.trim() ?? undefined;
                item.content = {
                    html: description,
                    text: $$('table.pages_content, div.article-content, div.TRS_UEDITOR, div.TRS_PreAppend').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('div.lsj-index-logo img').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="ColumnDescription"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="SiteName"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/lswz/:category{.+}?',
    name: '国家粮食和物资储备局',
    url: 'lswz.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/lswz',
    parameters: { category: '分类，默认为 `html/xinwen/index`，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [新闻发布](https://www.lswz.gov.cn/html/xinwen/index.shtml)，网址为 \`https://www.lswz.gov.cn/html/xinwen/index.shtml\`。截取 \`https://www.lswz.gov.cn/\` 到末尾 \`.shtml\` 的部分 \`html/xinwen/index\` 作为参数填入，此时路由为 [\`/gov/lswz/html/xinwen/index\`](https://rsshub.app/gov/lswz/html/xinwen/index)。
  :::

  | [新闻发布](https://www.lswz.gov.cn/html/xinwen/index.shtml)        | [党建工作](https://www.lswz.gov.cn/html/djgz/index.shtml)      |
  | ------------------------------------------------------------------ | -------------------------------------------------------------- |
  | [html/xinwen/index](https://rsshub.app/gov/lswz/html/xinwen/index) | [html/djgz/index](https://rsshub.app/gov/lswz/html/djgz/index) |

  | [粮食交易](https://www.lswz.gov.cn/html/zmhd/lysj/lsjy.shtml)          | [粮食质量](https://www.lswz.gov.cn/html/zmhd/lysj/lszl.shtml)          |
  | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
  | [html/zmhd/lysj/lsjy](https://rsshub.app/gov/lswz/html/zmhd/lysj/lsjy) | [html/zmhd/lysj/lszl](https://rsshub.app/gov/lswz/html/zmhd/lysj/lszl) |


  #### [业务频道](https://www.lswz.gov.cn/html/ywpd/index.shtml)

  | [粮食调控](https://www.lswz.gov.cn/html/ywpd/lstk/index.shtml)           | [物资储备](https://www.lswz.gov.cn/html/ywpd/wzcb/index.shtml)           | [能源储备](https://www.lswz.gov.cn/html/ywpd/nycb/index.shtml)           | [安全应急](https://www.lswz.gov.cn/html/ywpd/aqyj/index.shtml)           | [法规体改](https://www.lswz.gov.cn/html/ywpd/fgtg/index.shtml)           |
  | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
  | [html/ywpd/lstk/index](https://rsshub.app/gov/lswz/html/ywpd/lstk/index) | [html/ywpd/wzcb/index](https://rsshub.app/gov/lswz/html/ywpd/wzcb/index) | [html/ywpd/nycb/index](https://rsshub.app/gov/lswz/html/ywpd/nycb/index) | [html/ywpd/aqyj/index](https://rsshub.app/gov/lswz/html/ywpd/aqyj/index) | [html/ywpd/fgtg/index](https://rsshub.app/gov/lswz/html/ywpd/fgtg/index) |

  | [规划建设](https://www.lswz.gov.cn/html/ywpd/gjks/index.shtml)           | [财务审计](https://www.lswz.gov.cn/html/ywpd/cwsj/index.shtml)           | [仓储科技](https://www.lswz.gov.cn/html/ywpd/cckj/index.shtml)           | [执法督查](https://www.lswz.gov.cn/html/ywpd/zfdc/index.shtml)           | [国际交流](https://www.lswz.gov.cn/html/ywpd/gjjl/index.shtml)           |
  | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
  | [html/ywpd/gjks/index](https://rsshub.app/gov/lswz/html/ywpd/gjks/index) | [html/ywpd/cwsj/index](https://rsshub.app/gov/lswz/html/ywpd/cwsj/index) | [html/ywpd/cckj/index](https://rsshub.app/gov/lswz/html/ywpd/cckj/index) | [html/ywpd/zfdc/index](https://rsshub.app/gov/lswz/html/ywpd/zfdc/index) | [html/ywpd/gjjl/index](https://rsshub.app/gov/lswz/html/ywpd/gjjl/index) |

  | [人事人才](https://www.lswz.gov.cn/html/ywpd/rsrc/index.shtml)           | [标准质量](https://www.lswz.gov.cn/html/ywpd/bzzl/index.shtml)           | [粮食和储备研究](https://www.lswz.gov.cn/html/ywpd/lshcbyj/index.shtml)        |
  | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
  | [html/ywpd/rsrc/index](https://rsshub.app/gov/lswz/html/ywpd/rsrc/index) | [html/ywpd/bzzl/index](https://rsshub.app/gov/lswz/html/ywpd/bzzl/index) | [html/ywpd/lshcbyj/index](https://rsshub.app/gov/lswz/html/ywpd/lshcbyj/index) |

  #### [政策发布](https://www.lswz.gov.cn/html/zcfb/index.shtml)

  | [文件](https://www.lswz.gov.cn/html/zcfb/wenjian.shtml)            | [法律法规](https://www.lswz.gov.cn/html/zcfb/fggz-fg.shtml)        | [规章](https://www.lswz.gov.cn/html/zcfb/fggz-gz.shtml)            |
  | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
  | [html/zcfb/wenjian](https://rsshub.app/gov/lswz/html/zcfb/wenjian) | [html/zcfb/fggz-fg](https://rsshub.app/gov/lswz/html/zcfb/fggz-fg) | [html/zcfb/fggz-gz](https://rsshub.app/gov/lswz/html/zcfb/fggz-gz) |

  #### [通知公告](https://www.lswz.gov.cn/html/tzgg/index.shtml)

  | [行政通知](https://www.lswz.gov.cn/html/tzgg/xztz.shtml)     | [公告通告](https://www.lswz.gov.cn/html/tzgg/ggtg.shtml)     |
  | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | [html/tzgg/xztz](https://rsshub.app/gov/lswz/html/tzgg/xztz) | [html/tzgg/ggtg](https://rsshub.app/gov/lswz/html/tzgg/ggtg) |

  #### [粮食收购](https://www.lswz.gov.cn/html/zmhd/lysj/lssg-szym.shtml)

  | [收购数据](https://www.lswz.gov.cn/html/zmhd/lysj/lssg-szym.shtml)               | [政策·解读](https://www.lswz.gov.cn/html/zmhd/lysj/lssg-gzdt.shtml)              |
  | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
  | [html/zmhd/lysj/lssg-szym](https://rsshub.app/gov/lswz/html/zmhd/lysj/lssg-szym) | [html/zmhd/lysj/lssg-gzdt](https://rsshub.app/gov/lswz/html/zmhd/lysj/lssg-gzdt) |

  #### [粮食价格](https://www.lswz.gov.cn/html/zmhd/lysj/lsjg-scjc.shtml)

  | [市场监测](https://www.lswz.gov.cn/html/zmhd/lysj/lsjg-scjc.shtml)               | [市场价格](https://www.lswz.gov.cn/html/zmhd/lysj/lsjg-scjg.shtml)               |
  | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
  | [html/zmhd/lysj/lsjg-scjc](https://rsshub.app/gov/lswz/html/zmhd/lysj/lsjg-scjc) | [html/zmhd/lysj/lsjg-scjg](https://rsshub.app/gov/lswz/html/zmhd/lysj/lsjg-scjg) |

  `,
    categories: ['government'],

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
            source: ['www.lswz.gov.cn/:category?'],
            target: (params) => {
                const category = params.category;

                return `/gov/lswz${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '新闻发布',
            source: ['www.lswz.gov.cn/html/xinwen/index.shtml'],
            target: '/lswz/html/xinwen/index',
        },
        {
            title: '党建工作',
            source: ['www.lswz.gov.cn/html/djgz/index.shtml'],
            target: '/lswz/html/djgz/index',
        },
        {
            title: '业务频道 - 粮食调控',
            source: ['www.lswz.gov.cn/html/ywpd/lstk/index.shtml'],
            target: '/lswz/html/ywpd/lstk/index',
        },
        {
            title: '业务频道 - 物资储备',
            source: ['www.lswz.gov.cn/html/ywpd/wzcb/index.shtml'],
            target: '/lswz/html/ywpd/wzcb/index',
        },
        {
            title: '业务频道 - 能源储备',
            source: ['www.lswz.gov.cn/html/ywpd/nycb/index.shtml'],
            target: '/lswz/html/ywpd/nycb/index',
        },
        {
            title: '业务频道 - 安全应急',
            source: ['www.lswz.gov.cn/html/ywpd/aqyj/index.shtml'],
            target: '/lswz/html/ywpd/aqyj/index',
        },
        {
            title: '业务频道 - 法规体改',
            source: ['www.lswz.gov.cn/html/ywpd/fgtg/index.shtml'],
            target: '/lswz/html/ywpd/fgtg/index',
        },
        {
            title: '业务频道 - 规划建设',
            source: ['www.lswz.gov.cn/html/ywpd/gjks/index.shtml'],
            target: '/lswz/html/ywpd/gjks/index',
        },
        {
            title: '业务频道 - 财务审计',
            source: ['www.lswz.gov.cn/html/ywpd/cwsj/index.shtml'],
            target: '/lswz/html/ywpd/cwsj/index',
        },
        {
            title: '业务频道 - 仓储科技',
            source: ['www.lswz.gov.cn/html/ywpd/cckj/index.shtml'],
            target: '/lswz/html/ywpd/cckj/index',
        },
        {
            title: '业务频道 - 执法督查',
            source: ['www.lswz.gov.cn/html/ywpd/zfdc/index.shtml'],
            target: '/lswz/html/ywpd/zfdc/index',
        },
        {
            title: '业务频道 - 国际交流',
            source: ['www.lswz.gov.cn/html/ywpd/gjjl/index.shtml'],
            target: '/lswz/html/ywpd/gjjl/index',
        },
        {
            title: '业务频道 - 人事人才',
            source: ['www.lswz.gov.cn/html/ywpd/rsrc/index.shtml'],
            target: '/lswz/html/ywpd/rsrc/index',
        },
        {
            title: '业务频道 - 标准质量',
            source: ['www.lswz.gov.cn/html/ywpd/bzzl/index.shtml'],
            target: '/lswz/html/ywpd/bzzl/index',
        },
        {
            title: '业务频道 - 粮食和储备研究',
            source: ['www.lswz.gov.cn/html/ywpd/lshcbyj/index.shtml'],
            target: '/lswz/html/ywpd/lshcbyj/index',
        },
        {
            title: '政策发布 - 文件',
            source: ['www.lswz.gov.cn/html/zcfb/wenjian.shtml'],
            target: '/lswz/html/zcfb/wenjian',
        },
        {
            title: '政策发布 - 法律法规',
            source: ['www.lswz.gov.cn/html/zcfb/fggz-fg.shtml'],
            target: '/lswz/html/zcfb/fggz-fg',
        },
        {
            title: '政策发布 - 规章',
            source: ['www.lswz.gov.cn/html/zcfb/fggz-gz.shtml'],
            target: '/lswz/html/zcfb/fggz-gz',
        },
        {
            title: '通知公告 - 行政通知',
            source: ['www.lswz.gov.cn/html/tzgg/xztz.shtml'],
            target: '/lswz/html/tzgg/xztz',
        },
        {
            title: '通知公告 - 公告通告',
            source: ['www.lswz.gov.cn/html/tzgg/ggtg.shtml'],
            target: '/lswz/html/tzgg/ggtg',
        },
        {
            title: '粮食收购 - 收购数据',
            source: ['www.lswz.gov.cn/html/zmhd/lysj/lssg-szym.shtml'],
            target: '/lswz/html/zmhd/lysj/lssg-szym',
        },
        {
            title: '粮食收购 - 政策·解读',
            source: ['www.lswz.gov.cn/html/zmhd/lysj/lssg-gzdt.shtml'],
            target: '/lswz/html/zmhd/lysj/lssg-gzdt',
        },
        {
            title: '粮食价格 - 市场监测',
            source: ['www.lswz.gov.cn/html/zmhd/lysj/lsjg-scjc.shtml'],
            target: '/lswz/html/zmhd/lysj/lsjg-scjc',
        },
        {
            title: '粮食价格 - 市场价格',
            source: ['www.lswz.gov.cn/html/zmhd/lysj/lsjg-scjg.shtml'],
            target: '/lswz/html/zmhd/lysj/lsjg-scjg',
        },
        {
            title: '粮食交易',
            source: ['www.lswz.gov.cn/html/zmhd/lysj/lsjy.shtml'],
            target: '/lswz/html/zmhd/lysj/lsjy',
        },
        {
            title: '粮食质量',
            source: ['www.lswz.gov.cn/html/zmhd/lysj/lszl.shtml'],
            target: '/lswz/html/zmhd/lysj/lszl',
        },
    ],
};
