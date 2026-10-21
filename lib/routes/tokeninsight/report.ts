import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';

const getArticle = (url: string) =>
    cache.tryGet(`tokeninsight:article:${url}`, async () => {
        const response = await got(url);
        const $ = load(response.data);
        return { description: $('.detail_html_box').html() ?? '' };
    });

export const route: Route = {
    path: '/report/:lang?',
    categories: ['finance'],
    example: '/tokeninsight/report/en',
    parameters: { lang: 'Language, see below, Chinese by default' },
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
            source: ['tokeninsight.com/:lang/report'],
            target: '/report/:lang',
        },
    ],
    name: 'Research',
    maintainers: ['fuergaosi233'],
    handler,
    description: `Language:

| Chinese | English |
| ------- | ------- |
| zh      | en      |`,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';

    const getReports = async () => {
        const url = `${baseURL}api/user/search/getAllList`;
        const response = (
            await got.post(url, {
                form: {
                    isRecommend: 2,
                    language: lang === 'zh' ? 'cn' : lang,
                },
            })
        ).data;
        return response.data.reportList;
    };

    const getReportInfomation = async (report): Promise<DataItem> => {
        const { publishDate, title, id } = report;
        const reportUrl = `${baseURL}${lang}/report/${id}`;
        const { description } = await getArticle(reportUrl);
        return {
            title,
            description,
            pubDate: publishDate ? parseDate(publishDate) : undefined,
            link: reportUrl,
        };
    };
    const limit = getRouteLimit(ctx, 30);
    const reports = (await getReports()).slice(0, limit);
    const list = await pMap(reports, (element) => getReportInfomation(element), { concurrency: 3 });
    return {
        title: `${lang === 'zh' ? '报告' : 'Research'} | ${title}`,
        link: `${link}${lang}/report`,
        item: list,
    };
}
