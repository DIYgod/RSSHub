import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.beijing.gov.cn';
const zhengceRootUrl = 'https://zhengce.beijing.gov.cn';
const zhengceApiUrl = `${zhengceRootUrl}/bs/api/v2/server/th`;
const refererUrl = `${rootUrl}/`;

const categories = {
    zhengcefagui: {
        title: '政策文件',
        link: `${rootUrl}/zhengce/zhengcefagui/`,
    },
    declare: {
        title: '政策兑现项目申报',
        link: `${zhengceRootUrl}/#/declare`,
    },
    policy: {
        title: '政策兑现通知公告',
        link: `${zhengceRootUrl}/#/policy`,
    },
    zjtx: {
        title: '利企服务专题专精特新',
        link: `${rootUrl}/so/zcdh/zjtx`,
        webApiId: '1832982697404915713',
    },
    myjj: {
        title: '利企服务专题民营经济',
        link: `${rootUrl}/so/zcdh/myjj`,
        webApiId: '1833789672032100353',
    },
    jrfw: {
        title: '利企服务专题金融服务',
        link: `${rootUrl}/fuwu/lqfw/ztzl/jrfw/zcfb/`,
    },
    yshj: {
        title: '利企服务专题营商环境',
        link: `${rootUrl}/fuwu/lqfw/ztzl/yshj/dt/`,
    },
    zhaopin: {
        title: '事业单位招聘',
        link: `${rootUrl}/fwcj/quickQuery/page/zhaopin/index.html`,
    },
} as const;

type Category = keyof typeof categories;

function getHeaders(referer = refererUrl) {
    return {
        Referer: referer,
    };
}

function parsePubDateMeta(content?: string) {
    if (!content) {
        return;
    }
    // Some pages concatenate two datetimes in one PubDate meta; keep the first full timestamp.
    const match = content.match(/\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?/);
    if (!match) {
        return;
    }
    return timezone(parseDate(match[0]), 8);
}

function parseListPage(html: string, baseUrl: string, limit: number, listSelector = 'ul.list li') {
    const $ = load(html);

    return $(listSelector)
        .toArray()
        .slice(0, limit)
        .flatMap((element) => {
            const item = $(element);
            const anchor = item.find('a');
            const href = anchor.attr('href');
            const title = anchor.attr('title')?.trim() || anchor.text().trim();
            if (!href || !title) {
                return [];
            }
            const dateText = item.find('span').text().trim();
            return [
                {
                    title,
                    link: new URL(href, baseUrl).href,
                    pubDate: dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD'), 8) : undefined,
                },
            ];
        });
}

async function fetchWebApiItems(webApiId: string, referer: string, limit: number) {
    const response = await got.post(`${rootUrl}/so/webapi/${webApiId}`, {
        headers: getHeaders(referer),
        form: {
            page: '1',
            pageSize: String(limit),
            sort: 'dateDesc',
        },
    });

    const resultList = response.data?.data?.resultList ?? [];

    return resultList.map((item) => ({
        title: item.DRETITLE,
        link: item.URL,
        pubDate: item.DREDATE ? timezone(parseDate(item.DREDATE), 8) : undefined,
    }));
}

async function fetchDeclareItems(limit: number) {
    const response = await got(`${zhengceApiUrl}/theme/search`, {
        headers: getHeaders(`${zhengceRootUrl}/#/declare`),
        searchParams: {
            requestStatus: 0,
            enabled: 'Y',
            sort: 21,
            page: 1,
            pageSize: limit,
        },
    });

    const list = response.data?.data?.list ?? [];

    return list.map((item) => {
        const endDate = item.endDate ? String(item.endDate).slice(0, 10) : undefined;
        return {
            title: item.name,
            link: `${zhengceRootUrl}/#/declare/detail/${item.id}`,
            pubDate: item.createdAt ? parseDate(item.createdAt) : undefined,
            description: endDate ? `<p>申报截止：${endDate}</p>` : undefined,
        };
    });
}

async function fetchPolicyItems(limit: number) {
    const response = await got(`${zhengceApiUrl}/policy/search`, {
        headers: getHeaders(`${zhengceRootUrl}/#/policy`),
        searchParams: {
            page: 1,
            pageSize: limit,
            funType: 1,
            enabled: 'Y',
            sort: 11,
        },
    });

    const list = response.data?.data?.list ?? [];

    return list.map((item) => ({
        title: item.title,
        link: `${zhengceRootUrl}/policy/detail/${item.id}`,
        pubDate: item.createdAt ? parseDate(item.createdAt) : item.publishDate ? timezone(parseDate(item.publishDate, 'YYYY-MM-DD'), 8) : undefined,
    }));
}

async function fetchZhaopinItems(limit: number) {
    const response = await got.post(`${rootUrl}/fwcj/quickQuery/mongo/v2/query`, {
        headers: getHeaders(`${rootUrl}/fwcj/quickQuery/page/zhaopin/index.html`),
        json: {
            page: 0,
            pageSize: limit,
            sortField: 'createTime',
            sortType: 'desc',
            collection: '1003',
            and: [
                {
                    fieldName: 'cmsCategoryId',
                    criteriaType: '=',
                    queryFieldValue: '67f7341341ecec12898cb198',
                    queryFieldValueType: 'string',
                },
                {
                    fieldName: 'deleted',
                    criteriaType: '=',
                    queryFieldValue: 0,
                    queryFieldValueType: 'int',
                },
            ],
            or: [],
        },
    });

    const list = response.data?.data ?? [];

    return list
        .filter((item) => item.termId && item.title)
        .map((item) => {
            const { termBasicInfo = {} } = item;
            const endDate = termBasicInfo.l1;
            const area = termBasicInfo.l7;
            const description = item.contentHtml || item.content || item.remark || '';
            const deadline = endDate ? `<p>报名时间至：${String(endDate).slice(0, 10)}</p>` : '';

            return {
                title: item.title,
                link: `${rootUrl}/fwcj/quickQuery/page/zhaopin/detail.html?id=${item.termId}`,
                description: description || deadline ? description + deadline : undefined,
                pubDate: item.publishTime ? parseDate(item.publishTime) : item.createTime ? parseDate(item.createTime) : undefined,
                category: area ? [area] : undefined,
            };
        });
}

function isSameHost(link: string, base: string) {
    return new URL(link).hostname === new URL(base).hostname;
}

async function enrichHtmlItems(items: DataItem[], referer: string) {
    return await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: getHeaders(isSameHost(item.link, rootUrl) ? referer : item.link),
                });
                const $ = load(detailResponse.data);

                const pubDate = parsePubDateMeta($('meta[name="PubDate"]').attr('content'));
                if (pubDate) {
                    item.pubDate = pubDate;
                }

                item.author = $('meta[name="ContentSource"]').attr('content');
                item.description = $('#mainText').html() ?? item.description;

                return item;
            })
        )
    );
}

async function enrichPolicyItems(items: DataItem[]) {
    return await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const id = item.link.split('/').pop();
                if (!id) {
                    return item;
                }
                const response = await got(`${zhengceApiUrl}/policy/info`, {
                    headers: getHeaders(`${zhengceRootUrl}/#/policy`),
                    searchParams: { id },
                });
                const info = response.data?.data;
                if (!info) {
                    return item;
                }
                item.description = info.content ?? info.shortContent ?? item.description;
                if (info.createdAt) {
                    item.pubDate = parseDate(info.createdAt);
                } else if (info.publishDate) {
                    item.pubDate = timezone(parseDate(info.publishDate, 'YYYY-MM-DD'), 8);
                }
                return item;
            })
        )
    );
}

export const route: Route = {
    path: '/:category',
    categories: ['government'],
    example: '/gov/beijing/zhengcefagui',
    parameters: { category: '栏目，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.beijing.gov.cn/zhengce/zhengcefagui/'],
            target: '/gov/beijing/zhengcefagui',
        },
        {
            source: ['zhengce.beijing.gov.cn'],
            target: '/gov/beijing/declare',
        },
        {
            source: ['zhengce.beijing.gov.cn'],
            target: '/gov/beijing/policy',
        },
        {
            source: ['www.beijing.gov.cn/so/zcdh/zjtx'],
            target: '/gov/beijing/zjtx',
        },
        {
            source: ['www.beijing.gov.cn/so/zcdh/myjj'],
            target: '/gov/beijing/myjj',
        },
        {
            source: ['www.beijing.gov.cn/fuwu/lqfw/ztzl/jrfw/zcfb/'],
            target: '/gov/beijing/jrfw',
        },
        {
            source: ['www.beijing.gov.cn/fuwu/lqfw/ztzl/yshj/dt/'],
            target: '/gov/beijing/yshj',
        },
        {
            source: ['www.beijing.gov.cn/fwcj/quickQuery/page/zhaopin/index.html'],
            target: '/gov/beijing/zhaopin',
        },
    ],
    name: '北京市人民政府',
    maintainers: ['zll17'],
    handler,
    description: `| 政策文件     | 政策兑现项目申报 | 政策兑现通知公告 | 利企服务专题专精特新 | 利企服务专题民营经济 | 利企服务专题金融服务 | 利企服务专题营商环境 | 事业单位招聘 |
| ------------ | ---------------- | ---------------- | -------------------- | -------------------- | -------------------- | -------------------- | ------------ |
| zhengcefagui | declare          | policy           | zjtx                 | myjj                 | jrfw                 | yshj                 | zhaopin      |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') as Category;
    const config = categories[category];

    if (!config) {
        throw new Error(`Invalid category: ${category}`);
    }

    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    let items: DataItem[];

    switch (category) {
        case 'zhengcefagui': {
            const response = await got(config.link, {
                headers: getHeaders(config.link),
            });
            items = parseListPage(response.data, config.link, limit, 'ul.default_news li');
            items = await enrichHtmlItems(items, config.link);
            break;
        }
        case 'declare':
            items = await fetchDeclareItems(limit);
            break;
        case 'policy':
            items = await fetchPolicyItems(limit);
            items = await enrichPolicyItems(items);
            break;
        case 'zjtx':
            items = await fetchWebApiItems(categories.zjtx.webApiId, config.link, limit);
            break;
        case 'myjj':
            items = await fetchWebApiItems(categories.myjj.webApiId, config.link, limit);
            break;
        case 'jrfw':
        case 'yshj': {
            const response = await got(config.link, {
                headers: getHeaders(config.link),
            });
            items = parseListPage(response.data, config.link, limit);
            items = await enrichHtmlItems(items, config.link);
            break;
        }
        case 'zhaopin':
            items = await fetchZhaopinItems(limit);
            break;
        default:
            throw new Error(`Unsupported category: ${category}`);
    }

    return {
        title: `北京市人民政府 - ${config.title}`,
        link: config.link,
        item: items,
    };
}
