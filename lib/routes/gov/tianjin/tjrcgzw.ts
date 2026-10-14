import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tjrcgzw-notice/:cate/:subCate',
    categories: ['government'],
    example: '/gov/tianjin/tjrcgzw-notice/rczc/sjrczc/',
    parameters: {
        cate: '栏目分类，可在源网站 URL 中找到，例如 rczc（人才政策）',
        subCate: '子栏目分类，例如 sjrczc（市级人才政策）',
    },
    radar: [
        {
            source: ['hrss.tj.gov.cn/ztzl/ztzl1/tjrcgzw/rczc/sjrczc/'],
            target: '/tjrcgzw-notice/rczc/sjrczc',
        },
    ],
    name: '人才工作网-公告',
    url: 'hrss.tj.gov.cn/ztzl/ztzl1/tjrcgzw/',
    maintainers: ['HaoyuLee'],
    async handler(ctx) {
        const { cate, subCate } = ctx.req.param();
        const url = `https://hrss.tj.gov.cn/ztzl/ztzl1/tjrcgzw/${cate}/${subCate}/`;
        const { data: response } = await got(url);
        const noticeCate = load(response)('.routeBlockAuto').text().trim();
        const item = load(response)('ul.listUlBox01>li')
            .toArray()
            .map((el) => {
                const $ = load(el);
                const title = $('a').text().trim();
                const href = $('a').attr('href') || '';
                const date = $('span').text().trim();
                const pubDate = date ? timezone(parseDate(date, 'YYYY-MM-DD', true), 8) : undefined;
                const link = href!.includes('http') ? href : new URL(href, url).href;
                return {
                    title: `天津人才工作网:${title}`,
                    link,
                    pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
                    author: '天津人才工作网',
                    description: `
                        <h4>${noticeCate}</h4>
                        <a href="${link}">${title}</a>
                    `,
                };
            });
        return {
            title: '天津人才工作网-公告',
            link: url,
            item,
        };
    },
};
