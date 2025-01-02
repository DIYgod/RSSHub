import { Route } from '@/types';
import { getNoticeList } from './utils';

const url = 'https://lib.njxzc.edu.cn/pxyhd/list.htm';
const host = 'https://lib.njxzc.edu.cn';

export const route: Route = {
    path: '/libtzgg',
    categories: ['university'],
    example: '/njxzc/libtzgg',
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
            source: ['lib.njxzc.edu.cn/pxyhd/list.htm', 'lib.njxzc.edu.cn/'],
        },
    ],
    name: '图书馆通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'lib.njxzc.edu.cn/pxyhd/list.htm',
};

async function handler(ctx) {
    const out = await getNoticeList(
        ctx,
        url,
        host,
        'a',
        '.news_meta',
        {
            title: '.arti_title',
            content: '.wp_articlecontent',
            date: '.arti_update',
        },
        '.news'
    );

    return {
        title: '南京晓庄学院 -- 图书馆通知公告',
        link: url,
        item: out,
    };
}
