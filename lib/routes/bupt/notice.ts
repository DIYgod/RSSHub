/* eslint-disable no-console */
import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/bupt/notice',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'BUPT_WX_COOKIE',
                description: '北京邮电大学企业微信 -> 通知公告 -> cookie',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['my.bupt.edu.cn/list.jsp'],
        },
    ],
    name: '北京邮电大学校内通知',
    maintainers: ['YouXam'],
    handler: async () => {
        if (!config.bupt.wx_cookie) {
            throw new ConfigNotFoundError('Missing BUPT_WX_COOKIE');
        }
        const data = await ofetch('https://wx.bupt.edu.cn/portal-article-page/article-list/notice?limit=10&offset=0', {
            headers: {
                cookie: config.bupt.wx_cookie,
                accept: 'application/json',
            },
        });

        const items = data.map((item) => ({
            title: item.title,
            link: 'https://wx.bupt.edu.cn/portal-article-page/article/notice/' + item.id,
            description: item.content,
            pubDate: parseDate(item.createtime, 'YYYY/MM/DD HH:mm:ss'),
            author: item.author,
        }));
        return {
            title: '北京邮电大学校内通知',
            link: 'https://wx.bupt.edu.cn/portal-article-page/index/notice',
            item: items,
        };
    },
    url: 'my.bupt.edu.cn/',
};
