import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'news', id = '10' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl = 'https://www.cnljxh.org.cn';
    const targetUrl: string = new URL(`${category}/?classid=${id}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = $('div.main_left ul li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a');

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('span').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.content_title h2').text();
                const description: string | undefined = $$('div.content_div').html() ?? '';
                const authors: DataItem['author'] = $$('div.content_title p').text().split(/\s/)[0]?.split(/：/).pop();

                let processedItem: DataItem = {
                    title,
                    description,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    language,
                };

                const $enclosureEl: Cheerio<Element> = $$('div.content_div embed').first();
                const enclosureUrl: string | undefined = $enclosureEl.attr('src');

                if (enclosureUrl) {
                    processedItem = {
                        ...processedItem,
                        enclosure_url: new URL(enclosureUrl, targetUrl).href,
                        enclosure_type: `application/${enclosureUrl.split(/\./).pop()}`,
                        enclosure_title: title,
                    };
                }

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: `${$('title').text()}${$('div.mianbao').contents().last().text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.logo a img').attr('src') ? new URL($('div.logo a img').attr('src') as string, targetUrl).href : undefined,
        author: $('meta[name="keywords"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category?/:id?',
    name: '栏目',
    url: 'www.cnljxh.org.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/cnljxh/news/10',
    parameters: {
        category: {
            description: '分类，默认为 `news`，即行业新闻，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '行业新闻',
                    value: 'news',
                },
                {
                    label: '市场价格',
                    value: 'price',
                },
                {
                    label: '分析数据',
                    value: 'info',
                },
                {
                    label: '价格指数',
                    value: 'date',
                },
            ],
        },
        id: {
            description: '分类，默认为 `10`，即协会公告，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '协会专区 - 协会简介',
                    value: '24',
                },
                {
                    label: '协会专区 - 协会章程',
                    value: '25',
                },
                {
                    label: '协会专区 - 协会领导',
                    value: '26',
                },
                {
                    label: '协会专区 - 入会程序',
                    value: '27',
                },
                {
                    label: '协会专区 - 组织机构',
                    value: '28',
                },
                {
                    label: '协会专区 - 理事会员',
                    value: '29',
                },
                {
                    label: '协会专区 - 监事会',
                    value: '32',
                },
                {
                    label: '协会专区 - 专家委员会',
                    value: '30',
                },
                {
                    label: '协会公告',
                    value: '10',
                },
                {
                    label: '行业新闻 - 协会动态',
                    value: '8',
                },
                {
                    label: '行业新闻 - 企业动态',
                    value: '9',
                },
                {
                    label: '行业新闻 - 行业动态',
                    value: '11',
                },
                {
                    label: '政策法规 - 政策法规',
                    value: '12',
                },
                {
                    label: '行业标准 - 国家标准',
                    value: '13',
                },
                {
                    label: '行业标准 - 行业标准',
                    value: '14',
                },
                {
                    label: '行业标准 - 团体标准',
                    value: '15',
                },
                {
                    label: '减污降碳 - 超低排放',
                    value: '33',
                },
                {
                    label: '减污降碳 - 技术广角',
                    value: '16',
                },
                {
                    label: '市场价格 - 价格行情',
                    value: '299',
                },
                {
                    label: '市场价格 - 双焦运费',
                    value: '2143',
                },
                {
                    label: '市场价格 - 价格汇总',
                    value: '10039',
                },
                {
                    label: '分析数据 - 市场分析',
                    value: '575',
                },
                {
                    label: '分析数据 - 一周评述',
                    value: '5573',
                },
                {
                    label: '分析数据 - 核心数据',
                    value: '5417',
                },
                {
                    label: '价格指数 - 焦炭指数(MyCpic)',
                    value: '5575',
                },
                {
                    label: '价格指数 - 炼焦煤指数(MyCpic)',
                    value: '5907',
                },
                {
                    label: '价格指数 - 山西焦炭价格指数（SCSPI）',
                    value: '34',
                },
                {
                    label: '价格指数 - 中价·新华焦煤价格指数（CCP）',
                    value: '35',
                },
                {
                    label: '市场信息 - 汾渭',
                    value: '19',
                },
                {
                    label: '市场信息 - 化工宝',
                    value: '20',
                },
                {
                    label: '市场信息 - 百川',
                    value: '21',
                },
                {
                    label: '市场信息 - 焦化市场信息',
                    value: '22',
                },
                {
                    label: '市场信息 - 中国焦化信息',
                    value: '31',
                },
            ],
        },
    },
    description: `:::tip
订阅 [协会公告](https://www.cnljxh.org.cn/news/?classid=10)，其源网址为 \`https://www.cnljxh.org.cn/news/?classid=10\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/cnljxh/news/10\`](https://rsshub.app/cnljxh/news/10)。

订阅 [价格行情](https://www.cnljxh.org.cn/price/?classid=299)，其源网址为 \`https://www.cnljxh.org.cn/price/?classid=299\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/cnljxh/price/299\`](https://rsshub.app/cnljxh/price/299)。
:::

<details>
  <summary>更多分类</summary>

#### 协会专区

| [协会简介](https://www.cnljxh.org.cn/news/?classid=24) | [协会章程](https://www.cnljxh.org.cn/news/?classid=25) | [协会领导](https://www.cnljxh.org.cn/news/?classid=26) | [入会程序](https://www.cnljxh.org.cn/news/?classid=27) | [组织机构](https://www.cnljxh.org.cn/news/?classid=28) |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
| [24](https://rsshub.app/cnljxh/news/24)                | [25](https://rsshub.app/cnljxh/news/25)                | [26](https://rsshub.app/cnljxh/news/26)                | [27](https://rsshub.app/cnljxh/news/27)                | [28](https://rsshub.app/cnljxh/news/28)                |

| [理事会员](https://www.cnljxh.org.cn/news/?classid=29) | [监事会](https://www.cnljxh.org.cn/news/?classid=32) | [专家委员会](https://www.cnljxh.org.cn/news/?classid=30) |
| ------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------- |
| [29](https://rsshub.app/cnljxh/news/29)                | [32](https://rsshub.app/cnljxh/news/32)              | [30](https://rsshub.app/cnljxh/news/30)                  |

#### 协会公告

| [协会公告](https://www.cnljxh.org.cn/news/?classid=10) |
| ------------------------------------------------------ |
| [10](https://rsshub.app/cnljxh/news/10)                |

#### 行业新闻

| [协会动态](https://www.cnljxh.org.cn/news/?classid=8) | [企业动态](https://www.cnljxh.org.cn/news/?classid=9) | [行业动态](https://www.cnljxh.org.cn/news/?classid=11) |
| ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| [8](https://rsshub.app/cnljxh/news/8)                 | [9](https://rsshub.app/cnljxh/news/9)                 | [11](https://rsshub.app/cnljxh/news/11)                |

#### 政策法规

| [政策法规](https://www.cnljxh.org.cn/news/?classid=12) |
| ------------------------------------------------------ |
| [12](https://rsshub.app/cnljxh/news/12)                |

#### 行业标准

| [国家标准](https://www.cnljxh.org.cn/news/?classid=13) | [行业标准](https://www.cnljxh.org.cn/news/?classid=14) | [团体标准](https://www.cnljxh.org.cn/news/?classid=15) |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
| [13](https://rsshub.app/cnljxh/news/13)                | [14](https://rsshub.app/cnljxh/news/14)                | [15](https://rsshub.app/cnljxh/news/15)                |

#### 减污降碳

| [超低排放](https://www.cnljxh.org.cn/news/indexdp.php?classid=33) | [技术广角](https://www.cnljxh.org.cn/news/?classid=16) |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| [33](https://rsshub.app/cnljxh/news/33)                           | [16](https://rsshub.app/cnljxh/news/16)                |

#### 市场价格

| [价格行情](https://www.cnljxh.org.cn/price/?classid=299) | [双焦运费](https://www.cnljxh.org.cn/price/?classid=2143) | [价格汇总](https://www.cnljxh.org.cn/collect/?classid=10039) |
| -------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| [299](https://rsshub.app/cnljxh/price/299)               | [2143](https://rsshub.app/cnljxh/price/2143)              | [10039](https://rsshub.app/cnljxh/price/10039)               |

#### 分析数据

| [市场分析](https://www.cnljxh.org.cn/info/?classid=575) | [一周评述](https://www.cnljxh.org.cn/info/?classid=5573) | [核心数据](https://www.cnljxh.org.cn/info/?classid=5417) |
| ------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| [575](https://rsshub.app/cnljxh/info/575)               | [5573](https://rsshub.app/cnljxh/info/5573)              | [5417](https://rsshub.app/cnljxh/info/5417)              |

#### 价格指数

| [焦炭指数(MyCpic)](https://www.cnljxh.org.cn/date/?classid=5575) | [炼焦煤指数(MyCpic)](https://www.cnljxh.org.cn/date/?classid=5907) | [山西焦炭价格指数（SCSPI）](https://www.cnljxh.org.cn/news/index.php?classid=34) | [中价·新华焦煤价格指数（CCP）](https://www.cnljxh.org.cn/news/index.php?classid=35) |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [5575](https://rsshub.app/cnljxh/date/5575)                      | [5907](https://rsshub.app/cnljxh/date/5907)                        | [34](https://rsshub.app/cnljxh/news/34)                                          | [35](https://rsshub.app/cnljxh/news/35)                                             |

#### 市场信息

| [汾渭](https://www.cnljxh.org.cn/news/?classid=19) | [化工宝](https://www.cnljxh.org.cn/news/?classid=20) | [百川](https://www.cnljxh.org.cn/news/?classid=21) | [焦化市场信息](https://www.cnljxh.org.cn/news/?classid=22) | [中国焦化信息](https://www.cnljxh.org.cn/news/?classid=31) |
| -------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| [19](https://rsshub.app/cnljxh/news/19)            | [20](https://rsshub.app/cnljxh/news/20)              | [21](https://rsshub.app/cnljxh/news/21)            | [22](https://rsshub.app/cnljxh/news/22)                    | [31](https://rsshub.app/cnljxh/news/31)                    |

</details>
`,
    categories: ['new-media'],
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
            source: ['www.cnljxh.org.cn/:category'],
            target: (params, url) => {
                const urlObj: URL = new URL(url);
                const category: string = params.category;
                const id: string | undefined = urlObj.searchParams.get('classid') ?? undefined;

                return `/cnljxh${category ? `/${category}${id ? `/${id}` : ''}` : ''}`;
            },
        },
        {
            title: '协会专区 - 协会简介',
            source: ['www.cnljxh.org.cn/news/?classid=24'],
            target: '/news/24',
        },
        {
            title: '协会专区 - 协会章程',
            source: ['www.cnljxh.org.cn/news/?classid=25'],
            target: '/news/25',
        },
        {
            title: '协会专区 - 协会领导',
            source: ['www.cnljxh.org.cn/news/?classid=26'],
            target: '/news/26',
        },
        {
            title: '协会专区 - 入会程序',
            source: ['www.cnljxh.org.cn/news/?classid=27'],
            target: '/news/27',
        },
        {
            title: '协会专区 - 组织机构',
            source: ['www.cnljxh.org.cn/news/?classid=28'],
            target: '/news/28',
        },
        {
            title: '协会专区 - 理事会员',
            source: ['www.cnljxh.org.cn/news/?classid=29'],
            target: '/news/29',
        },
        {
            title: '协会专区 - 监事会',
            source: ['www.cnljxh.org.cn/news/?classid=32'],
            target: '/news/32',
        },
        {
            title: '协会专区 - 专家委员会',
            source: ['www.cnljxh.org.cn/news/?classid=30'],
            target: '/news/30',
        },
        {
            title: '协会公告',
            source: ['www.cnljxh.org.cn/news/?classid=10'],
            target: '/news/10',
        },
        {
            title: '行业新闻 - 协会动态',
            source: ['www.cnljxh.org.cn/news/?classid=8'],
            target: '/news/8',
        },
        {
            title: '行业新闻 - 企业动态',
            source: ['www.cnljxh.org.cn/news/?classid=9'],
            target: '/news/9',
        },
        {
            title: '行业新闻 - 行业动态',
            source: ['www.cnljxh.org.cn/news/?classid=11'],
            target: '/news/11',
        },
        {
            title: '政策法规',
            source: ['www.cnljxh.org.cn/news/?classid=12'],
            target: '/news/12',
        },
        {
            title: '行业标准 - 国家标准',
            source: ['www.cnljxh.org.cn/news/?classid=13'],
            target: '/news/13',
        },
        {
            title: '行业标准 - 行业标准',
            source: ['www.cnljxh.org.cn/news/?classid=14'],
            target: '/news/14',
        },
        {
            title: '行业标准 - 团体标准',
            source: ['www.cnljxh.org.cn/news/?classid=15'],
            target: '/news/15',
        },
        {
            title: '减污降碳 - 超低排放',
            source: ['www.cnljxh.org.cn/news/indexdp.php?classid=33'],
            target: '/news/33',
        },
        {
            title: '减污降碳 - 技术广角',
            source: ['www.cnljxh.org.cn/news/?classid=16'],
            target: '/news/16',
        },
        {
            title: '市场价格 - 价格行情',
            source: ['www.cnljxh.org.cn/price/?classid=299'],
            target: '/price/299',
        },
        {
            title: '市场价格 - 双焦运费',
            source: ['www.cnljxh.org.cn/price/?classid=2143'],
            target: '/price/2143',
        },
        {
            title: '市场价格 - 价格汇总',
            source: ['www.cnljxh.org.cn/collect/?classid=10039'],
            target: '/price/10039',
        },
        {
            title: '分析数据 - 市场分析',
            source: ['www.cnljxh.org.cn/info/?classid=575'],
            target: '/info/575',
        },
        {
            title: '分析数据 - 一周评述',
            source: ['www.cnljxh.org.cn/info/?classid=5573'],
            target: '/info/5573',
        },
        {
            title: '分析数据 - 核心数据',
            source: ['www.cnljxh.org.cn/info/?classid=5417'],
            target: '/info/5417',
        },
        {
            title: '价格指数 - 焦炭指数(MyCpic)',
            source: ['www.cnljxh.org.cn/date/?classid=5575'],
            target: '/date/5575',
        },
        {
            title: '价格指数 - 炼焦煤指数(MyCpic)',
            source: ['www.cnljxh.org.cn/date/?classid=5907'],
            target: '/date/5907',
        },
        {
            title: '价格指数 - 山西焦炭价格指数（SCSPI）',
            source: ['www.cnljxh.org.cn/news/index.php?classid=34'],
            target: '/news/34',
        },
        {
            title: '价格指数 - 中价·新华焦煤价格指数（CCP）',
            source: ['www.cnljxh.org.cn/news/index.php?classid=35'],
            target: '/news/35',
        },
        {
            title: '市场信息 - 汾渭',
            source: ['www.cnljxh.org.cn/news/?classid=19'],
            target: '/news/19',
        },
        {
            title: '市场信息 - 化工宝',
            source: ['www.cnljxh.org.cn/news/?classid=20'],
            target: '/news/20',
        },
        {
            title: '市场信息 - 百川',
            source: ['www.cnljxh.org.cn/news/?classid=21'],
            target: '/news/21',
        },
        {
            title: '市场信息 - 焦化市场信息',
            source: ['www.cnljxh.org.cn/news/?classid=22'],
            target: '/news/22',
        },
        {
            title: '市场信息 - 中国焦化信息',
            source: ['www.cnljxh.org.cn/news/?classid=31'],
            target: '/news/31',
        },
    ],
    view: ViewType.Articles,
};
