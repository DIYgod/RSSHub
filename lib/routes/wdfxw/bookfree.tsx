import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = 'https://www.wdfxw.net';
    const targetUrl: string = new URL(`bookfree${id ? `-${id}` : ''}.html`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('meta[http-equiv="Content-Language"]').attr('content') ?? 'zh-cn';

    let items: DataItem[] = $('ul.camWholeBoxUl li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('div.camLiTitleC a');

            const title: string = $aEl.attr('title') ?? $aEl.text();
            const image: string | undefined = $el.find('div.img img').attr('data-original') ?? $el.find('div.img img').attr('src');
            const description: string | undefined = renderToString(
                <WdfxwDescription
                    images={
                        image
                            ? [
                                  {
                                      src: image,
                                      alt: title,
                                  },
                              ]
                            : undefined
                    }
                />
            );
            const linkUrl: string | undefined = $aEl.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
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

                const title: string = $$('h1').text();
                const pubDateStr: string | undefined = $$('div.uhit li')
                    .filter((_, el) => $$(el).text().startsWith('上传时间'))
                    .text()
                    .split(/：/)
                    .pop();
                const categories: string[] = [
                    ...new Set([
                        ...$$('div.nav_uis a')
                            .slice(1)
                            .toArray()
                            .map((el) => $$(el).text()),
                        ...($$('meta[name="KeyWords"]').attr('content')?.split(/,/) ?? []),
                    ]),
                ];
                const authors: DataItem['author'] = $$('div.uhit li')
                    .filter((_, el) => $$(el).text().startsWith('上传人'))
                    .text()
                    .split(/：/)
                    .pop();
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    category: categories,
                    author: authors,
                    updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
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
        image: $('div.xxxk_top img').attr('src'),
        author: $('div.xxxk_top img').attr('alt'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/bookfree/:id?',
    name: '免费区',
    url: 'www.wdfxw.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/wdfxw/bookfree',
    parameters: {
        category: {
            description: '分类，默认为空，即全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '行业标准',
                    value: '00002',
                },
                {
                    label: '国家标准GB',
                    value: '00001',
                },
                {
                    label: '国外标准',
                    value: '00003',
                },
                {
                    label: '监理资料',
                    value: '00004',
                },
                {
                    label: '施工组织设计',
                    value: '00005',
                },
                {
                    label: '土木工程毕业设计论文',
                    value: '00006',
                },
                {
                    label: '机械类毕业设计论文',
                    value: '00007',
                },
                {
                    label: '小学课件教学资料',
                    value: '00008',
                },
                {
                    label: '初中课件教学资料',
                    value: '00009',
                },
                {
                    label: '高中课件教学资料',
                    value: '00010',
                },
                {
                    label: '工作计划个人总结',
                    value: '00011',
                },
                {
                    label: '中学小学教案导学案与教学设计',
                    value: '00012',
                },
                {
                    label: '作文大全',
                    value: '00013',
                },
                {
                    label: '幼儿教育',
                    value: '00014',
                },
                {
                    label: '论文',
                    value: '00015',
                },
                {
                    label: '财务管理',
                    value: '00016',
                },
                {
                    label: '管理信息化',
                    value: '00017',
                },
                {
                    label: '行业分类',
                    value: '00018',
                },
                {
                    label: '合同样本',
                    value: '00019',
                },
                {
                    label: '品质管理',
                    value: '00020',
                },
                {
                    label: '企业管理',
                    value: '00021',
                },
                {
                    label: '人力资源',
                    value: '00022',
                },
                {
                    label: '生产管理',
                    value: '00023',
                },
                {
                    label: '市场营销',
                    value: '00024',
                },
                {
                    label: '制度表格',
                    value: '00025',
                },
                {
                    label: '行业资料',
                    value: '00026',
                },
                {
                    label: '国家标准',
                    value: '00027',
                },
                {
                    label: '软件教程',
                    value: '00028',
                },
                {
                    label: '标准汇编',
                    value: '00029',
                },
                {
                    label: '其他',
                    value: '00030',
                },
                {
                    label: '职业资格考试',
                    value: '00031',
                },
                {
                    label: '股票证券行业研究报告(研报）',
                    value: '00032',
                },
                {
                    label: '基金申请',
                    value: '00033',
                },
                {
                    label: '教师资格证考试资料',
                    value: '00034',
                },
                {
                    label: '专利说明书',
                    value: '00035',
                },
            ],
        },
    },
    description: `::: tip
订阅 [行业标准](https://www.wdfxw.net/bookfree-00002.html)，其源网址为 \`https://www.wdfxw.net/bookfree-00002.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/wdfxw/bookfree/00002\`](https://rsshub.app/wdfxw/bookfree/00002)。
:::

<details>
  <summary>更多分类</summary>

| 分类                                                                      | ID                                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| [全部](https://www.wdfxw.net/bookfree.html)                               | [<无>](https://rsshub.app/wdfxw/bookfree)            |
| [行业标准](https://www.wdfxw.net/bookfree-00002.html)                     | [00002](https://rsshub.app/wdfxw/bookfree/00002)     |
| [国家标准 GB](https://www.wdfxw.net/bookfree-00001.html)                  | [00001](https://rsshub.app/wdfxw/bookfree/00001)     |
| [国外标准](https://www.wdfxw.net/bookfree-00003.html)                     | [00003](https://rsshub.app/wdfxw/bookfree/00003)     |
| [监理资料](https://www.wdfxw.net/bookfree-00004.html)                     | [00004](https://rsshub.app/wdfxw/bookfree/00004)     |
| [施工组织设计](https://极速.wdfxw.net/bookfree-00005.html)                | [00005](https://rsshub.app/wdfxw/bookfree/00005)     |
| [土木工程毕业设计论文](https://www.wdfxw.net/bookfree-00006.html)         | [00006](https://rsshub.app/wdfxw/bookfree/00006)     |
| [机械类毕业设计论文](https://www.wdfxw.net/bookfree-00007.html)           | [00007](https://rsshub.app/wdfxw/bookfree/00007)     |
| [小学课件教学资料](https://www.wdfxw.net/bookfree-00008.html)             | [00008](https://rsshub.app/wdfxw/bookfree/00008)     |
| [初中课件教学资料](https://www.wdfxw.net/bookfree-00009.html)             | [00009](https://rsshub.app/wdfxw/bookfree/00009)     |
| [高中课件教学资料](https://www.wdfxw.net/bookfree-00010.html)             | [00010](https://rsshub.app/wdfxw/bookfree/00010)     |
| [工作计划个人总结](https://www.wdfxw.net/bookfree-00011.html)             | [00011](极速//rsshub.app/wdfxw/bookfree/00011)       |
| [中学小学教案导学案与教学设计](https://www.wdfxw.net/bookfree-00012.html) | [00012](https://rsshub.app/wdfxw/bookfree/00012)     |
| [作文大全](https://www.wdfxw.net/bookfree-00013.html)                     | [00013](https://rsshub.app/wdfxw/bookfree/00013)     |
| [幼儿教育](https://www.wdfxw.net/bookfree-00014.html)                     | [00014](https://rsshub.app/wdfxw/bookfree/00014)     |
| [论文](https://www.wdfxw.net/bookfree-00015.html)                         | [00015](https://rsshub.app/wdfxw/bookfree/00015)     |
| [财务管理](https://www.wdfxw.net/bookfree-00016.html)                     | [00016](https://rsshub.app/wdfxw/bookfree/00016)     |
| [管理信息化](https://www.wdfxw.net/bookfree-00017.html)                   | [00017](https://rsshub.app/wdfxw/bookfree/00017)     |
| [行业分类](https://www.wdfxw.net/bookfree-00018.html)                     | [00018](https://rsshub.app/wdfxw/bookfree/00018)     |
| [合同样本](https://www.wdfxw.net/bookfree-00019.html)                     | [00019](https://rsshub.app/wdf极速xw/bookfree/00019) |
| [品质管理](https://www.wdfxw.net/bookfree-00020.html)                     | [00020](https://rsshub.app/wdfxw/bookfree/00020)     |
| [企业管理](https://www.wdfxw.net/bookfree-00021.html)                     | [00021](https://rsshub.app/wdfxw/bookfree/00021)     |
| [人力资源](https://www.wdfxw.net/bookfree-00022.html)                     | [00022](https://rsshub.app/wdfxw/bookfree/00022)     |
| [生产管理](https://www.wdfxw.net/bookfree-00023.html)                     | [00023](https://rsshub.app/wdfxw/bookfree/00023)     |
| [市场营销](https://www.wdfxw.net/bookfree-00024.html)                     | [00024](https://rsshub.app/wdfxw/bookfree/00024)     |
| [制度表格](https://www.wdfxw.net/bookfree-00025.html)                     | [00025](https://rsshub.app/wdfxw/bookfree/00025)     |
| [行业资料](https://www.wdfxw.net/bookfree-00026.html)                     | [00026](https://rsshub.app/wdfxw/bookfree/00026)     |
| [国家标准](https://www.wdfxw.net/bookfree-00027.html)                     | [00027](https://rsshub.app/wdfxw/bookfree/00027)     |
| [软件教程](https://www.wdfxw.net/bookfree-00028.html)                     | [00028](https://rsshub.app/wdfxw/bookfree/00028)     |
| [标准汇编](https://www.wdfxw.net/bookfree-00029.html)                     | [00029](https://rsshub.app/wdfxw/bookfree/00029)     |
| [其他](https://www.wdfxw.net/bookfree-00030.html)                         | [00030](https://rsshub.app/wdfxw/bookfree/00030)     |
| [职业资格考试](https://www.wdfxw.net/bookfree-00031.html)                 | [00031](https://rsshub.app/wdfxw/bookfree/00031)     |
| [股票证券行业研究报告(研报）](https://www.wdfxw.net/bookfree-00032.html)  | [00032](https://rsshub.app/wdfxw/bookfree/00032)     |
| [基金申请](https://www.wdfxw.net/bookfree-00033.html)                     | [00033](https://rsshub.app/wdfxw/bookfree/00033)     |
| [教师资格证考试资料](https://www.wdfxw.net/bookfree-00034.html)           | [00034](https://rsshub.app/wdfxw/bookfree/00034)     |
| [专利说明书](https://www.wdfxw.net/bookfree-00035.html)                   | [00035](https://rsshub.app/wdfxw/bookfree/00035)     |

</details>
`,
    categories: ['reading'],
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
            source: ['www.wdfxw.net'],
            target: '/bookfree',
        },
        {
            title: '全部',
            source: ['www.wdfxw.net/bookfree.html'],
            target: '/bookfree',
        },
        {
            title: '行业标准',
            source: ['www.wdfxw.net/bookfree-00002.html'],
            target: '/bookfree/00002',
        },
        {
            title: '国家标准GB',
            source: ['www.wdfxw.net/bookfree-00001.html'],
            target: '/bookfree/00001',
        },
        {
            title: '国外标准',
            source: ['www.wdfxw.net/bookfree-00003.html'],
            target: '/bookfree/00003',
        },
        {
            title: '监理资料',
            source: ['www.wdfxw.net/bookfree-00004.html'],
            target: '/bookfree/00004',
        },
        {
            title: '施工组织设计',
            source: ['www.wdfxw.net/bookfree-00005.html'],
            target: '/bookfree/00005',
        },
        {
            title: '土木工程毕业设计论文',
            source: ['www.wdfxw.net/bookfree-00006.html'],
            target: '/bookfree/00006',
        },
        {
            title: '机械类毕业设计论文',
            source: ['www.wdfxw.net/bookfree-00007.html'],
            target: '/bookfree/00007',
        },
        {
            title: '小学课件教学资料',
            source: ['www.wdfxw.net/bookfree-00008.html'],
            target: '/bookfree/00008',
        },
        {
            title: '初中课件教学资料',
            source: ['www.wdfxw.net/bookfree-00009.html'],
            target: '/bookfree/00009',
        },
        {
            title: '高中课件教学资料',
            source: ['www.wdfxw.net/bookfree-00010.html'],
            target: '/bookfree/00010',
        },
        {
            title: '工作计划个人总结',
            source: ['www.wdfxw.net/bookfree-00011.html'],
            target: '/bookfree/00011',
        },
        {
            title: '中学小学教案导学案与教学设计',
            source: ['www.wdfxw.net/bookfree-00012.html'],
            target: '/bookfree/00012',
        },
        {
            title: '作文大全',
            source: ['www.wdfxw.net/bookfree-00013.html'],
            target: '/bookfree/00013',
        },
        {
            title: '幼儿教育',
            source: ['www.wdfxw.net/bookfree-00014.html'],
            target: '/bookfree/00014',
        },
        {
            title: '论文',
            source: ['www.wdfxw.net/bookfree-00015.html'],
            target: '/bookfree/00015',
        },
        {
            title: '财务管理',
            source: ['www.wdfxw.net/bookfree-00016.html'],
            target: '/bookfree/00016',
        },
        {
            title: '管理信息化',
            source: ['www.wdfxw.net/bookfree-00017.html'],
            target: '/bookfree/00017',
        },
        {
            title: '行业分类',
            source: ['www.wdfxw.net/bookfree-00018.html'],
            target: '/bookfree/00018',
        },
        {
            title: '合同样本',
            source: ['www.wdfxw.net/bookfree-00019.html'],
            target: '/bookfree/00019',
        },
        {
            title: '品质管理',
            source: ['www.wdfxw.net/bookfree-00020.html'],
            target: '/bookfree/00020',
        },
        {
            title: '企业管理',
            source: ['www.wdfxw.net/bookfree-00021.html'],
            target: '/bookfree/00021',
        },
        {
            title: '人力资源',
            source: ['www.wdfxw.net/bookfree-00022.html'],
            target: '/bookfree/00022',
        },
        {
            title: '生产管理',
            source: ['www.wdfxw.net/bookfree-00023.html'],
            target: '/bookfree/00023',
        },
        {
            title: '市场营销',
            source: ['www.wdfxw.net/bookfree-00024.html'],
            target: '/bookfree/00024',
        },
        {
            title: '制度表格',
            source: ['www.wdfxw.net/bookfree-00025.html'],
            target: '/bookfree/00025',
        },
        {
            title: '行业资料',
            source: ['www.wdfxw.net/bookfree-00026.html'],
            target: '/bookfree/00026',
        },
        {
            title: '国家标准',
            source: ['www.wdfxw.net/bookfree-00027.html'],
            target: '/bookfree/00027',
        },
        {
            title: '软件教程',
            source: ['www.wdfxw.net/bookfree-00028.html'],
            target: '/bookfree/00028',
        },
        {
            title: '标准汇编',
            source: ['www.wdfxw.net/bookfree-00029.html'],
            target: '/bookfree/00029',
        },
        {
            title: '其他',
            source: ['www.wdfxw.net/bookfree-00030.html'],
            target: '/bookfree/00030',
        },
        {
            title: '职业资格考试',
            source: ['www.wdfxw.net/bookfree-00031.html'],
            target: '/bookfree/00031',
        },
        {
            title: '股票证券行业研究报告(研报）',
            source: ['www.wdfxw.net/bookfree-00032.html'],
            target: '/bookfree/00032',
        },
        {
            title: '基金申请',
            source: ['www.wdfxw.net/bookfree-00033.html'],
            target: '/bookfree/00033',
        },
        {
            title: '教师资格证考试资料',
            source: ['www.wdfxw.net/bookfree-00034.html'],
            target: '/bookfree/00034',
        },
        {
            title: '专利说明书',
            source: ['www.wdfxw.net/bookfree-00035.html'],
            target: '/bookfree/00035',
        },
    ],
    view: ViewType.Articles,
};

type WdfxwImage = {
    src?: string;
    alt?: string;
};

const WdfxwDescription = ({ images }: { images?: WdfxwImage[] }) => (
    <>
        {images?.map((image) =>
            image?.src ? (
                <figure>
                    <img src={image.src} alt={image.alt} />
                </figure>
            ) : null
        )}
    </>
);
