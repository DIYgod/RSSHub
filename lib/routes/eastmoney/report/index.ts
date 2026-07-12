import { load } from 'cheerio';
import dayjs from 'dayjs';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const reportType = {
    brokerreport: '券商晨报',
    industry: '行业研报',
    macresearch: '宏观研究',
    strategyreport: '策略报告',
    stock: '个股研报',
};

const linkType = {
    brokerreport: 'zw_brokerreport',
    industry: 'zw_industry',
    macresearch: 'zw_macresearch',
    strategyreport: 'zw_strategy',
    stock: 'info',
};

const qType = {
    brokerreport: 4,
    industry: 1,
    macresearch: 3,
    strategyreport: 2,
    stock: 0,
};

const categories = Object.keys(reportType) as Array<keyof typeof reportType>;
const datePattern = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const pageSize = 20;

const baseUrl = 'https://data.eastmoney.com';
const reqUrl = 'https://reportapi.eastmoney.com/report/jg';
const reqUrlStock = 'https://reportapi.eastmoney.com/report/list2';

function isValidDate(dateString: string): boolean {
    if (!datePattern.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function parseDateParameter(value: string, fieldName: string, defaultValue: string) {
    if (!value) {
        return defaultValue;
    }

    if (!isValidDate(value)) {
        throw new InvalidParameterError(`Invalid ${fieldName} format. Expected YYYY-MM-DD.`);
    }

    return value;
}

async function request(category, beginTime, endTime, pageNo, pageSize) {
    if (category === 'stock') {
        const { data: response } = await got.post(reqUrlStock, {
            json: {
                beginTime,
                endTime,
                pageNo,
                pageSize,
            },
        });

        const reports = response.data ?? [];

        return reports.map((item) => ({
            title: `[${item.orgSName}][${item.stockName}]${item.title}`,
            link: `${baseUrl}/report/${linkType[category as keyof typeof linkType]}/${item.infoCode}.html`,
            pubDate: parseDate(item.publishDate),
            author: item.researcher,
        }));
    }

    const { data: response } = await got(reqUrl, {
        searchParams: {
            beginTime,
            endTime,
            qType: qType[category as keyof typeof qType],
            pageNo,
            pageSize,
        },
    });

    const reports = response.data ?? [];

    return reports.map((item) => ({
        title: `[${item.orgSName}]${item.title}`,
        link: `${baseUrl}/report/${linkType[category as keyof typeof linkType]}.jshtml?encodeUrl=${item.encodeUrl}`,
        pubDate: parseDate(item.publishDate),
        author: item.researcher,
    }));
}

async function handler(ctx) {
    const category = (ctx.req.param('category') ?? 'strategyreport') as string;
    if (!categories.includes(category as keyof typeof reportType)) {
        throw new InvalidParameterError(`Invalid category: ${category}. Expected one of ${categories.join(', ')}`);
    }
    const beginDate = parseDateParameter(ctx.req.query('beginDate') ?? '', 'beginDate', dayjs().subtract(2, 'day').format('YYYY-MM-DD'));
    const endDate = parseDateParameter(ctx.req.query('endDate') ?? '', 'endDate', dayjs().format('YYYY-MM-DD'));

    const items = [];
    let page = 1;

    while (true) {
        // 后续请求依赖当前页返回的数据量，无法并行请求
        // eslint-disable-next-line no-await-in-loop
        const currentItems = (await request(category, beginDate, endDate, page, pageSize)) ?? [];

        items.push(...currentItems);

        if (currentItems.length < pageSize) {
            break;
        }

        page++;
    }

    const feedItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);

                    const pdfLink = $('.pdf-link').attr('href');
                    item.link = pdfLink || item.link;
                    item.description = $('.ctx-content').html();

                    return item;
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        title: `东方财富网-${reportType[category as keyof typeof reportType]}`,
        link: `${baseUrl}/report/${category}`,
        item: feedItems,
    };
}

export const route: Route = {
    path: '/report/:category',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/eastmoney/report/strategyreport?beginDate=2026-01-01&endDate=2026-01-31',
    parameters: {
        category: {
            description: '研报类型',
            options: [
                { value: 'strategyreport', label: '策略报告' },
                { value: 'macresearch', label: '宏观研究' },
                { value: 'brokerreport', label: '券商晨报' },
                { value: 'industry', label: '行业研报' },
                { value: 'stock', label: '个股研报' },
            ],
        },
        beginDate: '查询开始日期，格式为 `YYYY-MM-DD`，默认为当前日期前 2 天',
        endDate: '查询结束日期，格式为 `YYYY-MM-DD`，默认为当前日期',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['data.eastmoney.com/report/:category'],
        },
    ],
    name: '研究报告',
    maintainers: ['syzq', 'yeshunfa'],
    handler,
};
