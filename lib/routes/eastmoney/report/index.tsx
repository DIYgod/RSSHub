import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { getEpsOrPeStr, getRatingChangeStr } from '../utils';

export const route: Route = {
    path: '/report/:category',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/eastmoney/report/strategyreport',
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
    maintainers: ['syzq'],
    handler,
    description: `| 策略报告       | 宏观研究    | 券商晨报     | 行业研究 | 个股研报 |
| -------------- | ----------- | ------------ | -------- | -------- |
| strategyreport | macresearch | brokerreport | industry | stock    |`,
};

async function handler(ctx) {
    const baseUrl = 'https://data.eastmoney.com';
    const { category = 'strategyreport' } = ctx.req.param();

    const reportType = {
        brokerreport: '券商晨报',
        industry: '行业研报',
        macresearch: '宏观研究',
        strategyreport: '策略报告',
        stock: '个股研报',
    };
    if (!Object.hasOwn(reportType, category)) {
        throw new InvalidParameterError(`Invalid report category: ${category}. Use strategyreport, macresearch, brokerreport, industry, or stock.`);
    }
    const linkType = {
        brokerreport: 'zw_brokerreport',
        industry: 'zw_industry',
        macresearch: 'zw_macresearch',
        strategyreport: 'zw_strategy',
        stock: 'info',
    };

    const res = await got(`${baseUrl}/report/${category}`);
    const $ = load(res.data);

    const initData = JSON.parse(
        $('script')
            .text()
            .match(/var initdata(.=?)(.*?);/)![2]
    );

    const list: Array<DataItem & { pubDate: ReturnType<typeof parseDateInTimezone>; originItem?: (typeof initData.data)[number] }> = initData.data.map((item) => {
        const stockName = category === 'stock' ? `[${item.stockName}]` : '';
        return {
            title: `[${item.orgSName}]${stockName}${item.title}`,
            link: `${baseUrl}/report/${linkType[category]}` + (category === 'stock' ? `/${item.infoCode}.html` : `.jshtml?encodeUrl=${item.encodeUrl}`),
            pubDate: parseDateInTimezone(item.publishDate, 8),
            author: item.researcher,
            originItem: item, // temp use
        };
    });
    const items = await pMap(
        list,
        async (item) => {
            const tempOriginItem = item.originItem;
            delete item.originItem; // temp use

            const cached = await cache.tryGet(`eastmoney:report:article:${item.link}`, async () => {
                try {
                    const { data: response } = await got(item.link!);
                    const $ = load(response);
                    const pdfLink = $('.pdf-link').attr('href');
                    const enclosureUrl = pdfLink ? new URL(pdfLink, item.link).href : undefined;
                    if (enclosureUrl) {
                        item.enclosure_url = enclosureUrl;
                        item.enclosure_type = 'application/pdf';
                    }

                    if (category === 'stock') {
                        const { stockName, stockCode, emRatingName, ratingChange, indvInduName } = tempOriginItem;
                        const ratingChangeStr = getRatingChangeStr(ratingChange);
                        const currentYear = new Date().getFullYear();
                        const nextYear = currentYear + 1;
                        const description = $('.ctx-content').html();
                        const predictThisYearEps = getEpsOrPeStr(tempOriginItem.predictThisYearEps, 3);
                        const predictThisYearPe = getEpsOrPeStr(tempOriginItem.predictThisYearPe, 2);
                        const predictNextYearEps = getEpsOrPeStr(tempOriginItem.predictNextYearEps, 3);
                        const predictNextYearPe = getEpsOrPeStr(tempOriginItem.predictNextYearPe, 2);

                        item.description = renderToString(
                            <>
                                <table>
                                    <tbody>
                                        <tr>
                                            <th rowspan={2}>股票代码</th>
                                            <th rowspan={2}>股票简称</th>
                                            <th rowspan={2}>东财评级</th>
                                            <th rowspan={2}>评级变动</th>
                                            <th colspan={2}>{currentYear}盈利预测</th>
                                            <th colspan={2}>{nextYear}盈利预测</th>
                                            <th rowspan={2}>行业</th>
                                        </tr>
                                        <tr>
                                            <th>收益</th>
                                            <th>市盈率</th>
                                            <th>收益</th>
                                            <th>市盈率</th>
                                        </tr>
                                        <tr>
                                            <td>{stockCode}</td>
                                            <td>{stockName}</td>
                                            <td>{emRatingName}</td>
                                            <td>{ratingChangeStr}</td>
                                            <td>{predictThisYearEps}</td>
                                            <td>{predictThisYearPe}</td>
                                            <td>{predictNextYearEps}</td>
                                            <td>{predictNextYearPe}</td>
                                            <td>{indvInduName}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div>{description ? raw(description) : null}</div>
                            </>
                        );
                    } else {
                        item.description = $('.ctx-content').html();
                    }
                    return item;
                } catch {
                    return item;
                }
            });
            return { ...cached, link: item.link, pubDate: item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: `东方财富网-${reportType[category]}`,
        link: baseUrl,
        item: items,
    };
}
