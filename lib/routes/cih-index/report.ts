import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/report/list/:report?',
    categories: ['finance'],
    example: '/cih-index/report/list/p1-oaddtime-ddesc',
    parameters: { report: '报告 id，可在 URL 中找到，留空为 `p1-oaddtime-ddesc`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '报告',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.cih-index.com/report/list/p1-oaddtime-ddesc',
    radar: [
        {
            source: ['www.cih-index.com/report/list/:report'],
        },
    ],
};

async function handler(ctx) {
    const { report = 'p1-oaddtime-ddesc' } = ctx.req.param();

    const baseUrl = 'https://www.cih-index.com';
    const currentUrl = `${baseUrl}/report/list/${report}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const initialState = JSON.parse(
        $('script:contains("window.__INITIAL_STATE__")')
            .text()
            .match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/)?.[1] || '{}'
    );
    const { dataResult, indNavLists, secondNameFilter, tagList, param } = initialState.data;

    const items = dataResult.reportInfoDtoList.map((info) => {
        const pageCount = info.isCharging === 1 ? 3 : info.pageCount;
        let images = '';
        for (let i = 1; i <= pageCount; i++) {
            images += `<img src="${baseUrl}/report/bp-creis-report-detail/getImg?id=${info.reportId}&pageNum=${i}"><br>`;
        }
        return {
            title: info.reportTitle,
            link: `${baseUrl}/report/detail/${info.reportId}.html`,
            pubDate: timezone(parseDate(info.addTime), +8),
            category: [...new Set([...info.reportClassTagDtoList.map((t) => t.tag), ...(info.keywordList || [])])],
            description: `${info.context}<br>${images}`,
            image: `${info.coverFigureUrl}/200`,
        };
    });

    const category = param.firstId ? indNavLists.find((item) => item.classId === param.firstId)?.className + ' - ' : '';
    const subCategory = param.secondId ? secondNameFilter.find((item) => item.classId === param.secondId)?.className + ' - ' : '';
    const tag = param.tagId ? tagList.find((item) => item.tagId === Number.parseInt(param.tagId))?.tag + ' - ' : '';

    return {
        title: `${category}${subCategory}${tag}中指报告`,
        description: $('meta[name="description"]').attr('content'),
        image: `${baseUrl}/favicon.ico`,
        lang: 'zh-CN',
        link: currentUrl,
        item: items,
    };
}
