import { load } from 'cheerio';

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
const positiveIntegerPattern = /^\d+$/;
const datePattern = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

function isValidDate(dateString: string): boolean {
    if (!datePattern.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function parsePositiveInteger(value: string, fieldName: string, defaultValue: string) {
    if (!value) {
        return defaultValue;
    }

    if (!positiveIntegerPattern.test(value) || Number(value) <= 0) {
        throw new InvalidParameterError(`Invalid ${fieldName}. Expected a positive integer.`);
    }

    return value;
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

async function handler(ctx) {
    const { category: routeCategory, routeParams = '' } = ctx.req.param();
    const category = (routeCategory ?? 'strategyreport') as string;
    if (!categories.includes(category as keyof typeof reportType)) {
        throw new InvalidParameterError(`Invalid category: ${category}. Expected one of ${categories.join(', ')}`);
    }
    const params = new URLSearchParams(routeParams);
    const page = parsePositiveInteger(params.get('page') ?? '', 'page', '1');
    const pageSize = parsePositiveInteger(params.get('pageSize') ?? '', 'pageSize', '20');
    const beginDate = parseDateParameter(params.get('beginDate') ?? '', 'beginDate', '1900-01-01');
    const endDate = parseDateParameter(params.get('endDate') ?? '', 'endDate', '9999-12-31');

    const reqUrl = 'https://reportapi.eastmoney.com/report/jg';
    const baseUrl = 'https://data.eastmoney.com';

    const { data: response } = await got(reqUrl, {
        searchParams: {
            beginTime: beginDate,
            endTime: endDate,
            qType: qType[category as keyof typeof qType],
            pageNo: page,
            pageSize,
        },
    });

    const list = (response.data ?? []).map((item) => {
        const stockName = category === 'stock' ? `[${item.stockName}]` : '';
        return {
            title: `[${item.orgSName}]${stockName}${item.title}`,
            link: `${baseUrl}/report/${linkType[category as keyof typeof linkType]}` + (category === 'stock' ? `/${item.infoCode}.html` : `.jshtml?encodeUrl=${item.encodeUrl}`),
            pubDate: parseDate(item.publishDate),
            author: item.researcher,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
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
        item: items,
    };
}

export const route: Route = {
    path: '/report/:category/:routeParams?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/eastmoney/report/strategyreport/page=1&pageSize=20&beginDate=2026-01-01&endDate=2026-01-31',
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
        routeParams: '额外筛选参数，可选 `page`、`pageSize`、`beginDate`、`endDate`，例如 `page=1&pageSize=20&beginDate=2026-01-01&endDate=2026-01-31`',
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
