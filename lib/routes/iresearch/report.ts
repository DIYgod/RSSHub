import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

const types = {
    1: {
        label: '最新报告',
        value: 1,
        slug: 'products/GetReportList',
        detailSlug: 'Detail/reportM',
        imageSlug: 'rimgs',
        idKey: 'classId',
        limitKey: 'pageSize',
        detailKey: 'id',
        fixedQuery: {
            fee: 0,
        },
        detailFixedQuery: {
            isfree: 0,
        },
    },
    4: {
        label: '研究图表',
        value: 4,
        slug: 'products/getdatasapi',
        detailSlug: 'products/getonedatasapi',
        imageSlug: undefined,
        idKey: 'channelId',
        limitKey: 'pageSize',
        detailKey: 'id',
        fixedQuery: {
            rootId: 14,
        },
        detailFixedQuery: undefined,
    },
    3: {
        label: '周度市场观察',
        value: 3,
        slug: 'products/ireports',
        detailSlug: 'products/ireport',
        imageSlug: 'ireport',
        idKey: 'cid',
        limitKey: 'psize',
        detailKey: 'rid',
        fixedQuery: {
            pindex: 1,
        },
        detailFixedQuery: undefined,
    },
    2: {
        label: '热门报告',
        value: 2,
        slug: 'products/GetHotReportList',
        detailSlug: 'Detail/reportM',
        imageSlug: 'rimgs',
        idKey: 'classId',
        limitKey: 'pageSize',
        detailKey: 'id',
        fixedQuery: {
            fee: 0,
        },
        detailFixedQuery: {
            isfree: 0,
        },
    },
};

const idOptions = [
    {
        label: '全部',
        value: '',
    },
    {
        label: '家电行业',
        value: '1',
    },
    {
        label: '服装行业',
        value: '2',
    },
    {
        label: '美妆行业',
        value: '3',
    },
    {
        label: '食品饮料行业',
        value: '4',
    },
    {
        label: '酒行业',
        value: '5',
    },
    {
        label: '媒体文娱',
        value: '59',
    },
    {
        label: '广告营销',
        value: '89',
    },
    {
        label: '游戏行业',
        value: '90',
    },
    {
        label: '视频媒体',
        value: '91',
    },
    {
        label: '消费电商',
        value: '69',
    },
    {
        label: '电子商务',
        value: '86',
    },
    {
        label: '消费者洞察',
        value: '87',
    },
    {
        label: '旅游行业',
        value: '88',
    },
    {
        label: '汽车行业',
        value: '80',
    },
    {
        label: '教育行业',
        value: '63',
    },
    {
        label: '企业服务',
        value: '60',
    },
    {
        label: '网络服务',
        value: '84',
    },
    {
        label: '应用服务',
        value: '85',
    },
    {
        label: 'AI大数据',
        value: '65',
    },
    {
        label: '人工智能',
        value: '83',
    },
    {
        label: '物流行业',
        value: '75',
    },
    {
        label: '金融行业',
        value: '70',
    },
    {
        label: '支付行业',
        value: '82',
    },
    {
        label: '房产行业',
        value: '68',
    },
    {
        label: '医疗健康',
        value: '62',
    },
    {
        label: '先进制造',
        value: '61',
    },
    {
        label: '能源环保',
        value: '77',
    },
    {
        label: '区块链',
        value: '76',
    },
    {
        label: '其他',
        value: '81',
    },
];

const defaultType = 1;
const siteTitle = '艾瑞咨询';

export const handler = async (ctx: Context): Promise<Data> => {
    const { type: paramType = defaultType, id: paramId = '' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const typeObj = types?.[paramType] ?? Object.values(types).find((obj) => obj.label === paramType || obj.value === paramType);
    if (!typeObj) {
        throw new Error(`Invalid type: ${paramType}. Please refer to [the documentation](https://docs.rsshub.app/routes/other#${siteTitle}) for valid types.`);
    }

    const idObj = idOptions.find((option) => option.label === paramId || option.value === paramId);

    const type: number = typeObj.value;
    const id: string | undefined = idObj ? String(idObj.value) : undefined;

    const baseUrl = 'https://www.iresearch.com.cn';
    const imageBaseUrl = 'https://pic.iresearch.cn';
    const targetUrl: string = new URL(`report.shtml?type=${type}${id ? `&classId=${id}` : ''}`, baseUrl).href;
    const apiUrl: string = new URL(`api/${typeObj.slug}`, baseUrl).href;
    const apiDetailUrl: string = new URL(`api/${typeObj.detailSlug}`, baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            ...(id
                ? {
                      [typeObj.idKey]: id,
                  }
                : {}),
            [typeObj.limitKey]: limit,
            ...typeObj.fixedQuery,
        },
    });

    let items: DataItem[] = [];

    items = response.List.slice(0, limit).map((item): DataItem => {
        const title: string =
            item.reportname ??
            (() => {
                if (item.Title) {
                    const suffix: string = item.sTitle && item.sTitle !== item.Title ? ` - ${item.sTitle}` : '';
                    return `${item.Title}${suffix}`;
                }

                return item.sTitle ?? item.Content;
            })();

        const images: string[] = [item.BigImg, item.SmallImg, item.reportpic].filter(Boolean) as string[];
        const description: string | undefined = renderDescription({
            images: images.map((src) => ({
                src,
                alt: title,
            })),
            intro: item.Content,
        });

        const pubDate: number | string = item.Uptime ?? item.addtime;
        const linkUrl: string | undefined = item.VisitUrl;
        const categories: string[] = [...new Set([item.sTitle, item.industry, item.classname, ...(item.Keyword ?? [])])].filter(Boolean);
        const authors: DataItem['author'] = item.Author;
        const guid: string = item.Id ? `iresearch-${item.Id}` : item.id ? `iresearch-ireport.${item.id}` : '';
        const image: string | undefined = images?.[0] ?? undefined;
        const updated: number | string = pubDate;

        let processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
            link: item.id ? new URL(`report/detail?id=${item.id}`, baseUrl).href : (linkUrl ?? (item.Id ? new URL(`chart/detail?id=${item.id}`, baseUrl).href : undefined)),
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? timezone(parseDate(updated), +8) : undefined,
            detailId: item.id ?? (linkUrl ? item.NewsId : item.Id),
        };

        const medias: Record<string, Record<string, string>> = (() => {
            const result: Record<string, Record<string, string>> = {};
            const medium = 'image';
            let count = 0;

            for (const media of images) {
                const url: string | undefined = media;

                if (!url) {
                    continue;
                }

                count += 1;
                const key = `${medium}${count}`;

                result[key] = {
                    url,
                    medium,
                    title,
                    description: title,
                    thumbnail: url,
                };
            }

            return result;
        })();

        processedItem = {
            ...processedItem,
            media: medias,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link || (item.guid ? /chart\.\d+$/.test(item.guid) : false)) {
                delete item.detailId;
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(apiDetailUrl, {
                    query: {
                        [typeObj.detailKey]: item.detailId,
                        ...typeObj.detailFixedQuery,
                    },
                });
                const data = detailResponse.List?.[0] ?? detailResponse.List ?? undefined;

                if (!data) {
                    delete item.detailId;
                    return item;
                }

                const title: string = data.Title ?? data.reportname ?? item.title;
                const images: string[] = [
                    data.BigImg,
                    data.SmallImg,
                    data.Topic,
                    data.reportpic,
                    ...Array.from(
                        {
                            length: Number.parseInt(data.PagesCount ?? data.pagesCount, 10),
                        },
                        (_, index) => `${imageBaseUrl}/${typeObj.imageSlug}/${item.detailId}/${index + 1}.jpg`
                    ),
                ].filter(Boolean) as string[];
                const description: string | undefined = renderDescription({
                    images: images.map((src) => ({
                        src,
                        alt: title,
                    })),
                    description: data.Content,
                });
                const pubDate: number | string = data.Uptime;
                const categories: string[] = [...new Set([...(item.category ?? []), data.industry, ...(data.Keyword ?? []), ...(data.keywords?.split(/,/) ?? [])])].filter(Boolean);
                const image: string | undefined = images?.[0] ?? undefined;
                const updated: number | string = pubDate;

                let processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
                    category: categories,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: updated ? timezone(parseDate(updated), +8) : undefined,
                };

                const medias: Record<string, Record<string, string>> = (() => {
                    const result: Record<string, Record<string, string>> = {};
                    const medium = 'image';
                    let count = 0;

                    for (const media of images) {
                        const url: string | undefined = media;

                        if (!url) {
                            continue;
                        }

                        count += 1;
                        const key = `${medium}${count}`;

                        result[key] = {
                            url,
                            medium,
                            title,
                            description: title,
                            thumbnail: url,
                        };
                    }

                    return result;
                })();

                processedItem = {
                    ...processedItem,
                    media: medias,
                };

                delete item.detailId;

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: `${siteTitle}${typeObj.label ? ` - ${typeObj.label}` : ''}${idObj && idObj.label ? ` - ${idObj.label}` : ''}`,
        description: siteTitle,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: siteTitle,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/report/:type?/:id?',
    name: '研究报告',
    url: 'www.iresearch.com.cn',
    maintainers: ['brilon', 'Fatpandac', 'nczitzk'],
    handler,
    example: '/iresearch/report',
    parameters: {
        type: {
            description: '分类，默认为 `1`，即最新报告，可在对应分类页 URL 中找到',
            options: Object.values(types).map((item) => ({
                label: item.label,
                value: String(item.value),
            })),
        },
        id: {
            description: '行业 ID，默认为全部，即全部行业，可在对应行业页 URL 中找到',
            options: idOptions,
        },
    },
    description: `:::tip
订阅 [电子商务最新报告](https://www.iresearch.com.cn/report.shtml?type=1&classId=86)，其源网址为 \`https://www.iresearch.com.cn/report.shtml?type=1&classId=86\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/iresearch/report/最新报告/电子商务\`](https://rsshub.app/iresearch/report/最新报告/电子商务) 或 [\`/iresearch/report/1/86\`](https://rsshub.app/iresearch/report/1/86)。
:::

#### 分类

| [最新报告](https://www.iresearch.com.cn/report.shtml?type=1) | [研究图表](https://www.iresearch.com.cn/report.shtml?type=4) | [周度市场观察](https://www.iresearch.com.cn/report.shtml?type=3) | [热门报告](https://www.iresearch.com.cn/report.shtml?type=2) |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| [1](https://rsshub.app/iresearch/report/1)                   | [4](https://rsshub.app/iresearch/report/4)                   | [3](https://rsshub.app/iresearch/report/3)                       | [2](https://rsshub.app/iresearch/report/2)                   |

<details>
  <summary>更多行业</summary>

| 名称                                                                       | ID                                             |
| -------------------------------------------------------------------------- | ---------------------------------------------- |
| [家电行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=1)     | [1](https://rsshub.app/iresearch/report/3/1)   |
| [服装行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=2)     | [2](https://rsshub.app/iresearch/report/3/2)   |
| [美妆行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=3)     | [3](https://rsshub.app/iresearch/report/3/3)   |
| [食品饮料行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=4) | [4](https://rsshub.app/iresearch/report/3/4)   |
| [酒行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=5)       | [5](https://rsshub.app/iresearch/report/3/5)   |
| [媒体文娱](https://www.iresearch.com.cn/report.shtml?classId=59)           | [59](https://rsshub.app/iresearch/report/1/59) |
| [广告营销](https://www.iresearch.com.cn/report.shtml?classId=89)           | [89](https://rsshub.app/iresearch/report/1/89) |
| [游戏行业](https://www.iresearch.com.cn/report.shtml?classId=90)           | [90](https://rsshub.app/iresearch/report/1/90) |
| [视频媒体](https://www.iresearch.com.cn/report.shtml?classId=91)           | [91](https://rsshub.app/iresearch/report/1/91) |
| [消费电商](https://www.iresearch.com.cn/report.shtml?classId=69)           | [69](https://rsshub.app/iresearch/report/1/69) |
| [电子商务](https://www.iresearch.com.cn/report.shtml?classId=86)           | [86](https://rsshub.app/iresearch/report/1/86) |
| [消费者洞察](https://www.iresearch.com.cn/report.shtml?classId=87)         | [87](https://rsshub.app/iresearch/report/1/87) |
| [旅游行业](https://www.iresearch.com.cn/report.shtml?classId=88)           | [88](https://rsshub.app/iresearch/report/1/88) |
| [汽车行业](https://www.iresearch.com.cn/report.shtml?classId=80)           | [80](https://rsshub.app/iresearch/report/1/80) |
| [教育行业](https://www.iresearch.com.cn/report.shtml?classId=63)           | [63](https://rsshub.app/iresearch/report/1/63) |
| [企业服务](https://www.iresearch.com.cn/report.shtml?classId=60)           | [60](https://rsshub.app/iresearch/report/1/60) |
| [网络服务](https://www.iresearch.com.cn/report.shtml?classId=84)           | [84](https://rsshub.app/iresearch/report/1/84) |
| [应用服务](https://www.iresearch.com.cn/report.shtml?classId=85)           | [85](https://rsshub.app/iresearch/report/1/85) |
| [AI 大数据](https://www.iresearch.com.cn/report.shtml?classId=65)          | [65](https://rsshub.app/iresearch/report/1/65) |
| [人工智能](https://www.iresearch.com.cn/report.shtml?classId=83)           | [83](https://rsshub.app/iresearch/report/1/83) |
| [物流行业](https://www.iresearch.com.cn/report.shtml?classId=75)           | [75](https://rsshub.app/iresearch/report/1/75) |
| [金融行业](https://www.iresearch.com.cn/report.shtml?classId=70)           | [70](https://rsshub.app/iresearch/report/1/70) |
| [支付行业](https://www.iresearch.com.cn/report.shtml?classId=82)           | [82](https://rsshub.app/iresearch/report/1/82) |
| [房产行业](https://www.iresearch.com.cn/report.shtml?classId=68)           | [68](https://rsshub.app/iresearch/report/1/68) |
| [医疗健康](https://www.iresearch.com.cn/report.shtml?classId=62)           | [62](https://rsshub.app/iresearch/report/1/62) |
| [先进制造](https://www.iresearch.com.cn/report.shtml?classId=61)           | [61](https://rsshub.app/iresearch/report/1/61) |
| [能源环保](https://www.iresearch.com.cn/report.shtml?classId=77)           | [77](https://rsshub.app/iresearch/report/1/77) |
| [区块链](https://www.iresearch.com.cn/report.shtml?classId=76)             | [76](https://rsshub.app/iresearch/report/1/76) |
| [其他](https://www.iresearch.com.cn/report.shtml?classId=81)               | [81](https://rsshub.app/iresearch/report/1/81) |

</details>
`,
    categories: ['other'],
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
            source: ['www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const type: string | undefined = urlObj.searchParams.get('type') ?? undefined;
                const id: string | undefined = urlObj.searchParams.get('classId') ?? urlObj.searchParams.get('channelId') ?? urlObj.searchParams.get('cid') ?? undefined;

                return `/iresearch/report${type ? `/${type}${id ? `/${id}` : ''}` : ''}`;
            },
        },
        {
            title: '最新报告',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('classId') ?? urlObj.searchParams.get('channelId') ?? urlObj.searchParams.get('cid') ?? undefined;

                return `/iresearch/report/1${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '研究图表',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('classId') ?? urlObj.searchParams.get('channelId') ?? urlObj.searchParams.get('cid') ?? undefined;

                return `/iresearch/report/4${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '周度市场观察',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('classId') ?? urlObj.searchParams.get('channelId') ?? urlObj.searchParams.get('cid') ?? undefined;

                return `/iresearch/report/3${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '热门报告',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('classId') ?? urlObj.searchParams.get('channelId') ?? urlObj.searchParams.get('cid') ?? undefined;

                return `/iresearch/report/2${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '周度市场观察 - 家电行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/3/1',
        },
        {
            title: '周度市场观察 - 服装行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/3/2',
        },
        {
            title: '周度市场观察 - 美妆行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/3/3',
        },
        {
            title: '周度市场观察 - 食品饮料行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/3/4',
        },
        {
            title: '周度市场观察 - 酒行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/3/5',
        },
        {
            title: '最新报告 - 媒体文娱',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/59',
        },
        {
            title: '最新报告 - 广告营销',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/89',
        },
        {
            title: '最新报告 - 游戏行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/90',
        },
        {
            title: '最新报告 - 视频媒体',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/91',
        },
        {
            title: '最新报告 - 消费电商',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/69',
        },
        {
            title: '最新报告 - 电子商务',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/86',
        },
        {
            title: '最新报告 - 消费者洞察',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/87',
        },
        {
            title: '最新报告 - 旅游行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/88',
        },
        {
            title: '最新报告 - 汽车行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/80',
        },
        {
            title: '最新报告 - 教育行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/63',
        },
        {
            title: '最新报告 - 企业服务',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/60',
        },
        {
            title: '最新报告 - 网络服务',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/84',
        },
        {
            title: '最新报告 - 应用服务',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/85',
        },
        {
            title: '最新报告 - AI 大数据',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/65',
        },
        {
            title: '最新报告 - 人工智能',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/83',
        },
        {
            title: '最新报告 - 物流行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/75',
        },
        {
            title: '最新报告 - 金融行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/70',
        },
        {
            title: '最新报告 - 支付行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/82',
        },
        {
            title: '最新报告 - 房产行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/68',
        },
        {
            title: '最新报告 - 医疗健康',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/62',
        },
        {
            title: '最新报告 - 先进制造',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/61',
        },
        {
            title: '最新报告 - 能源环保',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/77',
        },
        {
            title: '最新报告 - 区块链',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/76',
        },
        {
            title: '最新报告 - 其他',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/report/1/81',
        },
    ],
    view: ViewType.Articles,
};
