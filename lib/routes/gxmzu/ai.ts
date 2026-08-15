import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseNoticeList, resolveArticles } from './utils';

const pageUrl = 'https://ai.gxmzu.edu.cn/index/tzgg.htm';

export const route: Route = {
    path: '/aitzgg',
    categories: ['university'],
    example: '/gxmzu/aitzgg',
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
            source: ['ai.gxmzu.edu.cn/index/tzgg.htm', 'ai.gxmzu.edu.cn/'],
        },
    ],
    name: '人工智能学院通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'ai.gxmzu.edu.cn/index/tzgg.htm',
};

async function handler() {
    const response = await ofetch(pageUrl);
    const $ = load(response);

    const list = parseNoticeList($, pageUrl, 'table.winstyle55267 tr[height="20"]', '.timestyle55267');
    const items = await resolveArticles(list, pageUrl, {
        title: '.titlestyle55269',
        content: '#vsb_newscontent',
        date: '.timestyle55269',
    });

    return {
        title: '广西民族大学人工智能学院 -- 通知公告',
        link: pageUrl,
        item: items,
    };
}
