import { Route } from '@/types';
import { getNoticeList } from './utils';

const url = 'https://ai.gxmzu.edu.cn/index/tzgg.htm';
const host = 'https://ai.gxmzu.edu.cn';

export const route: Route = {
    path: '/aitzgg',
    categories: ['university'],
    example: '/gxmzu/aitzgg',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
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

async function handler(ctx) {
    const out = await getNoticeList(ctx, url, host, 'a', '.timestyle55267', {
        title: '.titlestyle55269',
        content: '#vsb_newscontent',
        date: '.timestyle55269',
    });

    return {
        title: '广西民族大学人工智能学院 -- 通知公告',
        link: url,
        item: out,
    };
}
