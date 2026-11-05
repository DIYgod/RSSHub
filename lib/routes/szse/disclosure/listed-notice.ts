import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

function isValidDate(dateString: string): boolean {
    // Validate the YYYY-MM-DD format.
    const regex = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(dateString)) {
        return false;
    }

    // Reject impossible calendar dates, such as 2025-02-30.
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Months are zero-indexed.

    // Ensure that the parsed date matches the input.
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = '' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 50);
    const query: string = ctx.req.param('query') ?? '';
    const queries = {
        stock: '',
        beginDate: '',
        endDate: '',
    };
    if (query) {
        for (const pair of query.split('&')) {
            const [key, value] = pair.split('=', 2);
            if (key) {
                queries[key] = value;
            }
        }
    }
    if (queries.beginDate && !isValidDate(queries.beginDate)) {
        throw new Error('Invalid beginDate format. Expected YYYY-MM-DD');
    }
    if (queries.endDate) {
        if (!isValidDate(queries.endDate)) {
            throw new Error('Invalid endDate format. Expected YYYY-MM-DD');
        }
    } else if (queries.beginDate) {
        // Use the start date as the end date when only the start is specified.
        queries.endDate = queries.beginDate;
    }
    const baseUrl = 'https://www.szse.cn';
    const staticBaseUrl = 'https://disc.static.szse.cn';
    const apiUrl: string = new URL('api/disc/announcement/annList', baseUrl).href;
    const targetUrl: string = new URL(`disclosure/listed/notice${category}`, baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;
    const response = await ofetch(apiUrl, {
        method: 'POST',
        body: {
            stock: queries.stock ? [queries.stock] : [],
            seDate: [queries.beginDate, queries.endDate],
            channelCode: ['listedNotice_disc'],
            pageSize: limit,
            pageNum: 1,
        },
    });

    const items: DataItem[] = response.data
        .slice(0, limit)
        .map((item): DataItem => {
            const title: string = item.title;
            const pubDate: number | string = item.publishTime;
            const linkUrl: string | undefined = `disclosure/listed/bulletinDetail/index.html?${item.id}`;
            const categories: string[] = [...new Set([...item.secCode, ...item.secName, item.bigCategoryId, item.bigIndustryCode, item.smallCategoryId].filter(Boolean))];
            const guid = `szse-${item.id}`;
            const updated: number | string = item.publishTime;

            let processedItem: DataItem = {
                title,
                pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
                link: new URL(linkUrl, baseUrl).href,
                category: categories,
                guid,
                id: guid,
                updated: updated ? timezone(parseDate(updated), 8) : undefined,
                language,
            };

            const enclosureUrl: string | undefined = item.attachPath ? new URL(`download${item.attachPath}`, staticBaseUrl).href : undefined;

            if (enclosureUrl) {
                const enclosureType = `application/${item.attachFormat}`;

                processedItem = {
                    ...processedItem,
                    enclosure_url: enclosureUrl,
                    enclosure_type: enclosureType,
                    enclosure_title: title,
                    enclosure_length: undefined,
                };
            }

            return processedItem;
        })
        .filter((_): _ is DataItem => true);

    return {
        title: '深圳证券交易所 - 上市公司公告',
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('a.navbar-brand img').attr('src'),
        author: $('meta[name="author"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/disclosure/listed/notice/:query?',
    name: '上市公司公告',
    url: 'www.szse.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/szse/disclosure/listed/notice',
    parameters: { query: 'Filter options. can filte by "stock","beginDate","endDate". example:"stock=000001&beginDate=2025-07-01&endDate=2025-08-30"' },
    description: undefined,
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
            source: ['www.szse.cn/disclosure/listed/notice/index.html'],
            target: '/disclosure/listed/notice',
        },
    ],
    view: ViewType.Articles,
};
