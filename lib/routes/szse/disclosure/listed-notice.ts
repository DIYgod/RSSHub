import { type Data, type DataItem, type Route, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

function isValidDate(dateString: string): boolean {
    // 正则表达式检查格式：YYYY-MM-DD
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!regex.test(dateString)) {
        return false;
    }

    // 解析日期并验证有效性（避免像 2025-02-30 这样的无效日期）
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // 月份从 0 开始

    // 检查解析后的日期是否与输入一致
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = '' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);
    const query: string = ctx.req.param('query') ?? '';
    const queries: Record<string, string> = {
        stock: '',
        beginDate: '',
        endDate: '',
    };
    if (query) {
        for (const pair of query.split('&')) {
            const [key, value] = pair.split('=');
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
        // 如果只提供了开始日期，则将结束日期设置为开始日期
        queries.endDate = queries.beginDate;
    }
    const baseUrl: string = 'https://www.szse.cn';
    const staticBaseUrl: string = 'https://disc.static.szse.cn';
    const apiUrl: string = new URL('api/disc/announcement/annList', baseUrl).href;
    const targetUrl: string = new URL(`disclosure/listed/notice${category}`, baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';
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
            const guid: string = `szse-${item.id}`;
            const updated: number | string = item.publishTime;

            let processedItem: DataItem = {
                title,
                pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
                link: new URL(linkUrl, baseUrl).href,
                category: categories,
                guid,
                id: guid,
                updated: updated ? timezone(parseDate(updated), +8) : undefined,
                language,
            };

            const enclosureUrl: string | undefined = new URL(`download${item.attachPath}`, staticBaseUrl).href;

            if (enclosureUrl) {
                const enclosureType: string = `application/${item.attachFormat}`;

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
        allowEmpty: true,
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
