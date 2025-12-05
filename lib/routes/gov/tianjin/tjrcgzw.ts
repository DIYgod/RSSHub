import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tianjin/tjrcgzw-notice/:cate/:subCate',
    categories: ['government'],
    example: '/gov/tianjin/tjrcgzw-notice/rczc/sjrczc/',
    parameters: {
        channelId: '公告分类id、详细信息点击源网站https://hrss.tj.gov.cn/ztzl/ztzl1/tjrcgzw/请求中寻找',
    },
    radar: [
        {
            source: ['hrss.tj.gov.cn/ztzl/ztzl1/tjrcgzw/'],
            target: '/tianjin/tjrcgzw-notice/:cate/:subCate',
        },
    ],
    name: '天津人才工作网-公告',
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
                const link = href!.includes('http') ? href : new URL(href, url).href;
                return {
                    title: `天津人才工作网:${title}`,
                    link,
                    pubDate: parseDate(date),
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
