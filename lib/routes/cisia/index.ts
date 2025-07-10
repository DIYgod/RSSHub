import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { id = '9' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const domain = 'www.cisia.org';
    const rootUrl = `http://${domain}`;
    const currentUrl = new URL(`site/term/${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.list_first li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                pubDate: parseDate(item.find('span.time').text()),
                link: new URL(a.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!/^https?:\/\/www\.cisia\.org(\/[^\s]*)?$/.test(item.link)) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.TextTitle').text();
                const description = $$('div.NewsText').html();
                const pubDate = $$('div.shar')
                    .text()
                    .match(/(\d{4}-\d{2}-\d{2})/)?.[1];

                item.title = title;
                item.description = description;
                item.pubDate = pubDate ? parseDate(pubDate) : item.pubDate;
                item.author = $$('meta[name="Description"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div.NewsText').text(),
                };

                return item;
            })
        )
    );

    const image = new URL($('div.logo img').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="Description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="Keywords"]').prop('content'),
    };
};

export const route: Route = {
    path: '/:id?',
    name: '栏目',
    url: 'www.cisia.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/cisia/9',
    parameters: { id: '栏目 id，默认为 `9`，即协会动态，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [市场信息](http://www.cisia.org/site/term/12.html)，网址为 \`http://www.cisia.org/site/term/12.html\`。截取 \`https://www.cisia.org/site/term/\` 到末尾 \`.html\` 的部分 \`12\` 作为参数填入，此时路由为 [\`/cisia/12\`](https://rsshub.app/cisia/12)。
:::

<details>
<summary>更多分类</summary>

#### [分支机构信息](http://www.cisia.org/site/term/14.html)

| [企业动态](http://www.cisia.org/site/term/17.html) | [产品展示](http://www.cisia.org/site/term/18.html) |
| -------------------------------------------------- | -------------------------------------------------- |
| [17](https://rsshub.app/cisia/17)                  | [18](https://rsshub.app/cisia/18)                  |

#### [新闻中心](http://www.cisia.org/site/term/8.html)

| [协会动态](http://www.cisia.org/site/term/9.html) | [行业新闻](http://www.cisia.org/site/term/10.html) | [通知公告](http://www.cisia.org/site/term/11.html) | [市场信息](http://www.cisia.org/site/term/12.html) |
| ------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [9](https://rsshub.app/cisia/9)                   | [10](https://rsshub.app/cisia/10)                  | [11](https://rsshub.app/cisia/11)                  | [12](https://rsshub.app/cisia/12)                  |

#### [政策法规](http://www.cisia.org/site/term/19.html)

| [宏观聚焦](http://www.cisia.org/site/term/20.html) | [技术园区](http://www.cisia.org/site/term/396.html) |
| -------------------------------------------------- | --------------------------------------------------- |
| [20](https://rsshub.app/cisia/20)                  | [396](https://rsshub.app/cisia/396)                 |

#### [合作交流](http://www.cisia.org/site/term/22.html)

| [国际交流](http://www.cisia.org/site/term/23.html) | [行业交流](http://www.cisia.org/site/term/24.html) | [企业调研](http://www.cisia.org/site/term/25.html) | [会展信息](http://www.cisia.org/site/term/84.html) | [宣传专题](http://www.cisia.org/site/term/430.html) |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| [23](https://rsshub.app/cisia/23)                  | [24](https://rsshub.app/cisia/24)                  | [25](https://rsshub.app/cisia/25)                  | [84](https://rsshub.app/cisia/84)                  | [430](https://rsshub.app/cisia/430)                 |

#### [党建工作](http://www.cisia.org/site/term/26.html)

| [党委文件](http://www.cisia.org/site/term/27.html) | [学习园地](http://www.cisia.org/site/term/28.html) | [两会专题](http://www.cisia.org/site/term/443.html) |
| -------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| [27](https://rsshub.app/cisia/27)                  | [28](https://rsshub.app/cisia/28)                  | [443](https://rsshub.app/cisia/443)                 |

#### [网上服务平台](http://www.cisia.org/site/term/29.html)

| [前沿科技](http://www.cisia.org/site/term/31.html) | [新材料新技术](http://www.cisia.org/site/term/133.html) | [文件共享](http://www.cisia.org/site/term/30.html) |
| -------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| [31](https://rsshub.app/cisia/31)                  | [133](https://rsshub.app/cisia/133)                     | [30](https://rsshub.app/cisia/30)                  |

#### [会员社区](http://www.cisia.org/site/term/34.html)

| [会员分布](http://www.cisia.org/site/term/35.html) | [会员风采](http://www.cisia.org/site/term/68.html) |
| -------------------------------------------------- | -------------------------------------------------- |
| [35](https://rsshub.app/cisia/35)                  | [68](https://rsshub.app/cisia/68)                  |

</details>
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
            source: ['www.cisia.org/site/term/:id'],
            target: (params) => {
                const id = params.id.replace(/\.html/, '');

                return id ? `/${id}` : '';
            },
        },
        {
            title: '分支机构信息 - 企业动态',
            source: ['www.cisia.org/site/term/17.html'],
            target: '/17',
        },
        {
            title: '分支机构信息 - 产品展示',
            source: ['www.cisia.org/site/term/18.html'],
            target: '/18',
        },
        {
            title: '新闻中心 - 协会动态',
            source: ['www.cisia.org/site/term/9.html'],
            target: '/9',
        },
        {
            title: '新闻中心 - 行业新闻',
            source: ['www.cisia.org/site/term/10.html'],
            target: '/10',
        },
        {
            title: '新闻中心 - 通知公告',
            source: ['www.cisia.org/site/term/11.html'],
            target: '/11',
        },
        {
            title: '新闻中心 - 市场信息',
            source: ['www.cisia.org/site/term/12.html'],
            target: '/12',
        },
        {
            title: '政策法规 - 宏观聚焦',
            source: ['www.cisia.org/site/term/20.html'],
            target: '/20',
        },
        {
            title: '政策法规 - 技术园区',
            source: ['www.cisia.org/site/term/396.html'],
            target: '/396',
        },
        {
            title: '合作交流 - 国际交流',
            source: ['www.cisia.org/site/term/23.html'],
            target: '/23',
        },
        {
            title: '合作交流 - 行业交流',
            source: ['www.cisia.org/site/term/24.html'],
            target: '/24',
        },
        {
            title: '合作交流 - 企业调研',
            source: ['www.cisia.org/site/term/25.html'],
            target: '/25',
        },
        {
            title: '合作交流 - 会展信息',
            source: ['www.cisia.org/site/term/84.html'],
            target: '/84',
        },
        {
            title: '合作交流 - 宣传专题',
            source: ['www.cisia.org/site/term/430.html'],
            target: '/430',
        },
        {
            title: '党建工作 - 党委文件',
            source: ['www.cisia.org/site/term/27.html'],
            target: '/27',
        },
        {
            title: '党建工作 - 学习园地',
            source: ['www.cisia.org/site/term/28.html'],
            target: '/28',
        },
        {
            title: '党建工作 - 两会专题',
            source: ['www.cisia.org/site/term/443.html'],
            target: '/443',
        },
        {
            title: '网上服务平台 - 前沿科技',
            source: ['www.cisia.org/site/term/31.html'],
            target: '/31',
        },
        {
            title: '网上服务平台 - 新材料新技术',
            source: ['www.cisia.org/site/term/133.html'],
            target: '/133',
        },
        {
            title: '网上服务平台 - 文件共享',
            source: ['www.cisia.org/site/term/30.html'],
            target: '/30',
        },
        {
            title: '会员社区 - 会员分布',
            source: ['www.cisia.org/site/term/35.html'],
            target: '/35',
        },
        {
            title: '会员社区 - 会员风采',
            source: ['www.cisia.org/site/term/68.html'],
            target: '/68',
        },
    ],
};
