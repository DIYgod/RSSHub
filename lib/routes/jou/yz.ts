import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseNoticeList, resolveArticles } from './utils';

const pageUrl = 'https://yz.jou.edu.cn/index/zxgg.htm';

export const route: Route = {
    path: '/yztzgg',
    categories: ['university'],
    example: '/jou/yztzgg',
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
            source: ['yz.jou.edu.cn/index/zxgg.htm', 'yz.jou.edu.cn/'],
        },
    ],
    name: '研招网通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'yz.jou.edu.cn/index/zxgg.htm',
};

async function handler() {
    const response = await ofetch(pageUrl);
    const $ = load(response);

    const list = parseNoticeList($, pageUrl, 'table.winstyle207638 tr[height="20"]', '.timestyle207638');
    const items = await resolveArticles(list, {
        title: '.titlestyle207543',
        content: '.v_news_content',
        date: '.timestyle207543',
    });

    return {
        title: '江苏海洋大学 -- 研招通知公告',
        link: pageUrl,
        item: items,
    };
}
