import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';

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
    maintainers: [],
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

    const getReportInfomation = async (report) => {
        const { publishDate, title, id } = report;
        const reportUrl = `${baseURL}${lang}/report/${id}`;
        const description = await cache.tryGet(reportUrl, async () => {
            const res = await got(reportUrl);
            const $ = load(res.data);
            const description = $('.detail_html_box').html();
            return description;
        });
        return {
            // 文章标题
            title,
            // 文章正文
            description,
            // 文章发布时间
            pubDate: parseDate(publishDate),
            // 文章链接
            link: reportUrl,
        };
    };
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30;
    const reports = (await getReports()).slice(0, limit);
    const list = await Promise.all(reports.map((element) => getReportInfomation(element)));
    return {
        title: `${lang === 'zh' ? '报告' : 'Research'} | ${title}`,
        link: `${link}${lang}/report`,
        item: list,
    };
}
