import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'ywdt/hjyw' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '15', 10);

    const baseUrl = 'https://nnsa.mee.gov.cn';
    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = $('a.cjcx_biaob, ul#div li a')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.text();
            const linkUrl: string | undefined = $el.attr('href');

            const processedItem: DataItem = {
                title,
                link: linkUrl ? (linkUrl.startsWith('http') ? linkUrl : new URL(linkUrl as string, baseUrl).href) : undefined,
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

                const title: string = $$('meta[name="ArticleTitle"]').attr('content') ?? item.title;
                const description: string | undefined = $$('div.Custom_UnionStyle').html() ?? undefined;
                const pubDateStr: string | undefined = $$('meta[name="PubDate"]').attr('content');
                const categoryEls: Array<Cheerio<Element>> = [$$('meta[name="ColumnName"]'), $$('meta[name="ColumnType"]'), $$('meta[name="ContentSource"]'), $$('meta[name="source"]')];
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el)?.attr('content') ?? '').filter(Boolean))];
                const authors: DataItem['author'] = [$$('meta[name="Author"]'), $$('meta[name="author"]'), $$('meta[name="source"]')]
                    .filter((authorEl) => $$(authorEl).attr('content'))
                    .map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $$authorEl.attr('content') ?? '',
                        };
                    });
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.logo img').attr('src') ? new URL($('a.logo img').attr('src') as string, baseUrl).href : undefined,
        author: $('meta[name="SiteName"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/mee/nnsa/:category{.+}?',
    name: '国家核安全局',
    url: 'nnsa.mee.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/mee/nnsa/ywdt/hjyw',
    parameters: {
        category: {
            description: '分类，默认为 `ywdt/hjyw`，即环境要闻，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '要闻动态 - 时政要闻',
                    value: 'ywdt/szyw',
                },
                {
                    label: '要闻动态 - 环境要闻',
                    value: 'ywdt/hjyw',
                },
                {
                    label: '要闻动态 - 监管动态',
                    value: 'ywdt/gzdt',
                },
                {
                    label: '要闻动态 - 行业资讯',
                    value: 'ywdt/hyzx',
                },
                {
                    label: '要闻动态 - 国际资讯',
                    value: 'ywdt/gjzx',
                },
                {
                    label: '要闻动态 - 公示公告',
                    value: 'ywdt/gsqg',
                },
                {
                    label: '要闻动态 - 曝光台',
                    value: 'ywdt/bgt',
                },
                {
                    label: '政策文件 - 中央有关文件',
                    value: 'zcwj/zyygwj',
                },
                {
                    label: '政策文件 - 国务院有关文件',
                    value: 'zcwj/gwyygwj',
                },
                {
                    label: '政策文件 - 部文件',
                    value: 'zcwj/bwj',
                },
                {
                    label: '政策文件 - 核安全局文件',
                    value: 'zcwj/haqjwj',
                },
                {
                    label: '政策文件 - 其他',
                    value: 'zcwj/qt',
                },
                {
                    label: '政策文件 - 解读',
                    value: 'zcwj/jd',
                },
                {
                    label: '业务工作 - 核动力厂和研究堆',
                    value: 'ywdh/fyd',
                },
                {
                    label: '业务工作 - 核燃料、放废',
                    value: 'ywdh/hrlff',
                },
                {
                    label: '业务工作 - 核技术、电磁、矿冶',
                    value: 'ywdh/hjsdcky',
                },
                {
                    label: '业务工作 - 监测与应急',
                    value: 'ywdh/jcyj_1',
                },
                {
                    label: '业务工作 - 核安全设备与人员',
                    value: 'ywdh/haqsbry',
                },
                {
                    label: '业务工作 - 国际合作',
                    value: 'ywdh/gjhz',
                },
            ],
        },
    },
    description: `:::tip
订阅 [环境要闻](https://nnsa.mee.gov.cn/ywdt/hjyw/)，其源网址为 \`https://nnsa.mee.gov.cn/ywdt/hjyw/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/gov/mee/nnsa/ywdt/hjyw\`](https://rsshub.app/gov/mee/nnsa/ywdt/hjyw)。
:::

<details>
  <summary>更多分类</summary>

  #### [要闻动态](https://nnsa.mee.gov.cn/ywdt/)

  | 分类                                           | ID                                                     |
  | ---------------------------------------------- | ------------------------------------------------------ |
  | [时政要闻](https://nnsa.mee.gov.cn/ywdt/szyw/) | [ywdt/szyw](https://rsshub.app/gov/mee/nnsa/ywdt/szyw) |
  | [环境要闻](https://nnsa.mee.gov.cn/ywdt/hjyw/) | [ywdt/hjyw](https://rsshub.app/gov/mee/nnsa/ywdt/hjyw) |
  | [监管动态](https://nnsa.mee.gov.cn/ywdt/gzdt/) | [ywdt/gzdt](https://rsshub.app/gov/mee/nnsa/ywdt/gzdt) |
  | [行业资讯](https://nnsa.mee.gov.cn/ywdt/hyzx/) | [ywdt/hyzx](https://rsshub.app/gov/mee/nnsa/ywdt/hyzx) |
  | [国际资讯](https://nnsa.mee.gov.cn/ywdt/gjzx/) | [ywdt/gjzx](https://rsshub.app/gov/mee/nnsa/ywdt/gjzx) |
  | [公示公告](https://nnsa.mee.gov.cn/ywdt/gsqg/) | [ywdt/gsqg](https://rsshub.app/gov/mee/nnsa/ywdt/gsqg) |
  | [曝光台](https://nnsa.mee.gov.cn/ywdt/bgt/)    | [ywdt/bgt](https://rsshub.app/gov/mee/nnsa/ywdt/bgt)   |

  #### [政策文件](https://nnsa.mee.gov.cn/zcwj/)

  | 分类                                                    | ID                                                           |
  | ------------------------------------------------------- | ------------------------------------------------------------ |
  | [中央有关文件](https://nnsa.mee.gov.cn/zcwj/zyygwj/)    | [zcwj/zyygwj](https://rsshub.app/gov/mee/nnsa/zcwj/zyygwj)   |
  | [国务院有关文件](https://nnsa.mee.gov.cn/zcwj/gwyygwj/) | [zcwj/gwyygwj](https://rsshub.app/gov/mee/nnsa/zcwj/gwyygwj) |
  | [部文件](https://nnsa.mee.gov.cn/zcwj/bwj/)             | [zcwj/bwj](https://rsshub.app/gov/mee/nnsa/zcwj/bwj)         |
  | [核安全局文件](https://nnsa.mee.gov.cn/zcwj/haqjwj/)    | [zcwj/haqjwj](https://rsshub.app/gov/mee/nnsa/zcwj/haqjwj)   |
  | [其他](https://nnsa.mee.gov.cn/zcwj/qt/)                | [zcwj/qt](https://rsshub.app/gov/mee/nnsa/zcwj/qt)           |
  | [解读](https://nnsa.mee.gov.cn/zcwj/jd/)                | [zcwj/jd](https://rsshub.app/gov/mee/nnsa/zcwj/jd)           |

  #### [业务工作](https://nnsa.mee.gov.cn/ywdh/)

  | 分类                                                        | ID                                                           |
  | ----------------------------------------------------------- | ------------------------------------------------------------ |
  | [核动力厂和研究堆](https://nnsa.mee.gov.cn/ywdh/fyd/)       | [ywdh/fyd](https://rsshub.app/gov/mee/nnsa/ywdh/fyd)         |
  | [核燃料、放废](https://nnsa.mee.gov.cn/ywdh/hrlff/)         | [ywdh/hrlff](https://rsshub.app/gov/mee/nnsa/ywdh/hrlff)     |
  | [核技术、电磁、矿冶](https://nnsa.mee.gov.cn/ywdh/hjsdcky/) | [ywdh/hjsdcky](https://rsshub.app/gov/mee/nnsa/ywdh/hjsdcky) |
  | [监测与应急](https://nnsa.mee.gov.cn/ywdh/jcyj_1/)          | [ywdh/jcyj_1](https://rsshub.app/gov/mee/nnsa/ywdh/jcyj_1)   |
  | [核安全设备与人员](https://nnsa.mee.gov.cn/ywdh/haqsbry/)   | [ywdh/haqsbry](https://rsshub.app/gov/mee/nnsa/ywdh/haqsbry) |
  | [国际合作](https://nnsa.mee.gov.cn/ywdh/gjhz/)              | [ywdh/gjhz](https://rsshub.app/gov/mee/nnsa/ywdh/gjhz)       |

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
            source: ['nnsa.mee.gov.cn/:category'],
            target: '/mee/nnsa/:category',
        },
        {
            title: '要闻动态 - 时政要闻',
            source: ['nnsa.mee.gov.cn/ywdt/szyw/'],
            target: '/mee/nnsa/ywdt/szyw',
        },
        {
            title: '要闻动态 - 环境要闻',
            source: ['nnsa.mee.gov.cn/ywdt/hjyw/'],
            target: '/mee/nnsa/ywdt/hjyw',
        },
        {
            title: '要闻动态 - 监管动态',
            source: ['nnsa.mee.gov.cn/ywdt/gzdt/'],
            target: '/mee/nnsa/ywdt/gzdt',
        },
        {
            title: '要闻动态 - 行业资讯',
            source: ['nnsa.mee.gov.cn/ywdt/hyzx/'],
            target: '/mee/nnsa/ywdt/hyzx',
        },
        {
            title: '要闻动态 - 国际资讯',
            source: ['nnsa.mee.gov.cn/ywdt/gjzx/'],
            target: '/mee/nnsa/ywdt/gjzx',
        },
        {
            title: '要闻动态 - 公示公告',
            source: ['nnsa.mee.gov.cn/ywdt/gsqg/'],
            target: '/mee/nnsa/ywdt/gsqg',
        },
        {
            title: '要闻动态 - 曝光台',
            source: ['nnsa.mee.gov.cn/ywdt/bgt/'],
            target: '/mee/nnsa/ywdt/bgt',
        },
        {
            title: '政策文件 - 中央有关文件',
            source: ['nnsa.mee.gov.cn/zcwj/zyygwj/'],
            target: '/mee/nnsa/zcwj/zyygwj',
        },
        {
            title: '政策文件 - 国务院有关文件',
            source: ['nnsa.mee.gov.cn/zcwj/gwyygwj/'],
            target: '/mee/nnsa/zcwj/gwyygwj',
        },
        {
            title: '政策文件 - 部文件',
            source: ['nnsa.mee.gov.cn/zcwj/bwj/'],
            target: '/mee/nnsa/zcwj/bwj',
        },
        {
            title: '政策文件 - 核安全局文件',
            source: ['nnsa.mee.gov.cn/zcwj/haqjwj/'],
            target: '/mee/nnsa/zcwj/haqjwj',
        },
        {
            title: '政策文件 - 其他',
            source: ['nnsa.mee.gov.cn/zcwj/qt/'],
            target: '/mee/nnsa/zcwj/qt',
        },
        {
            title: '政策文件 - 解读',
            source: ['nnsa.mee.gov.cn/zcwj/jd/'],
            target: '/mee/nnsa/zcwj/jd',
        },
        {
            title: '业务工作 - 核动力厂和研究堆',
            source: ['nnsa.mee.gov.cn/ywdh/fyd/'],
            target: '/mee/nnsa/ywdh/fyd',
        },
        {
            title: '业务工作 - 核燃料、放废',
            source: ['nnsa.mee.gov.cn/ywdh/hrlff/'],
            target: '/mee/nnsa/ywdh/hrlff',
        },
        {
            title: '业务工作 - 核技术、电磁、矿冶',
            source: ['nnsa.mee.gov.cn/ywdh/hjsdcky/'],
            target: '/mee/nnsa/ywdh/hjsdcky',
        },
        {
            title: '业务工作 - 监测与应急',
            source: ['nnsa.mee.gov.cn/ywdh/jcyj_1/'],
            target: '/mee/nnsa/ywdh/jcyj_1',
        },
        {
            title: '业务工作 - 核安全设备与人员',
            source: ['nnsa.mee.gov.cn/ywdh/haqsbry/'],
            target: '/mee/nnsa/ywdh/haqsbry',
        },
        {
            title: '业务工作 - 国际合作',
            source: ['nnsa.mee.gov.cn/ywdh/gjhz/'],
            target: '/mee/nnsa/ywdh/gjhz',
        },
    ],
    view: ViewType.Articles,
};
