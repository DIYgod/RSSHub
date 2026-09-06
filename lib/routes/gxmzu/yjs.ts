import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseNoticeList, resolveArticles } from './utils';

const pageUrl = 'https://yjs.gxmzu.edu.cn/tzgg/zsgg.htm';

export const route: Route = {
    path: '/yjszsgg',
    categories: ['university'],
    example: '/gxmzu/yjszsgg',
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
            source: ['yjs.gxmzu.edu.cn/tzgg/zsgg.htm', 'yjs.gxmzu.edu.cn/'],
        },
    ],
    name: '研究生院招生公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'yjs.gxmzu.edu.cn/tzgg/zsgg.htm',
};

async function handler() {
    const response = await ofetch(pageUrl);
    const $ = load(response);

    // The graduate school shares the same Boda CMS template with the AI college, so the list and article style IDs are identical
    const list = parseNoticeList($, pageUrl, 'table.winstyle55267 tr[height="20"]', '.timestyle55267');
    const items = await resolveArticles(list, pageUrl, {
        title: '.titlestyle55269',
        content: '#vsb_newscontent',
        date: '.timestyle55269',
    });

    return {
        title: '广西民族大学研究生院 -- 招生公告',
        link: pageUrl,
        item: items,
    };
}
