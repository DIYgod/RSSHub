import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tianjin/tjftz-notice/:channelId',
    categories: ['government'],
    example: '/gov/tianjin/tjftz-notice/6302',
    parameters: {
        channelId: '公告分类id、详细信息点击源网站https://www.tjftz.gov.cn/请求中寻找',
    },
    radar: [
        {
            source: ['tjftz.gov.cn/channels/:channelId.html'],
            target: '/tianjin/tjftz-notice/:channelId',
        },
    ],
    name: '天津港保税区-公告',
    url: 'tjftz.gov.cn',
    maintainers: ['HaoyuLee'],
    description: `
| 公告类别         | channelId |
| ------------ | -- |
| 首页>新闻>保税区要闻>区域聚焦     | 6302  |
    `,
    async handler(ctx) {
        const { channelId = '6302' } = ctx.req.param();
        const url = `https://www.tjftz.gov.cn/channels/${channelId}.html`;
        const { data: response } = await got(url);
        const noticeCate = load(response)('.location').text().trim();
        const item = load(response)('#sec_right>ul li>.layui-row')
            .toArray()
            .map((el) => {
                const $ = load(el);
                return {
                    title: `天津保税区:${$('a').attr('title')}`,
                    link: `https://www.tjftz.gov.cn${$('a').attr('href')}`,
                    pubDate: parseDate($('span').text().trim()),
                    author: '天津保税区',
                    description: `
                        <h4>${noticeCate}</h4>
                        <a href="https://www.tjftz.gov.cn${$('a').attr('href')}">${$('a').attr('title')}</a>
                    `,
                };
            });
        return {
            title: '天津港保税区-公告',
            link: url,
            item,
        };
    },
};
