import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseNoticeList, resolveArticles } from './utils';

const pageUrl = 'https://www.jou.edu.cn/index/tzgg.htm';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/jou/tzgg',
    parameters: {},
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
            source: ['www.jou.edu.cn/index/tzgg.htm', 'www.jou.edu.cn/'],
        },
    ],
    name: '官网通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'www.jou.edu.cn/index/tzgg.htm',
};

async function handler() {
    const response = await ofetch(pageUrl);
    const $ = load(response);

    const list = parseNoticeList($, pageUrl, 'table.winstyle106390 tr[height="20"]', '.timestyle106390');
    const items = await resolveArticles(list, {
        title: '.titlestyle106402',
        content: '.v_news_content',
        date: '.timestyle106402',
    });

    return {
        title: '江苏海洋大学 -- 通知公告',
        link: pageUrl,
        item: items,
    };
}
