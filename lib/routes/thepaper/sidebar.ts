import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import utils from './utils';

const sections = {
    hotNews: '澎湃热榜',
    financialInformationNews: '澎湃快讯',
    morningEveningNews: '早晚报',
    editorHandpicked: '要闻精选',
};

export const route: Route = {
    path: '/sidebar/:sec?',
    radar: [
        {
            source: ['thepaper.cn/'],
            target: '/sidebar',
        },
    ],
    name: '侧边栏',
    categories: ['new-media'],
    example: '/thepaper/sidebar',
    parameters: {
        sec: {
            description: '侧边栏 id',
            options: Object.entries(sections).map(([key, value]) => ({ label: value, value: key })),
        },
    },
    maintainers: ['bigfei'],
    handler,
    url: 'thepaper.cn/',
};

async function handler(ctx) {
    const { sec = 'hotNews' } = ctx.req.param();

    const sidebarUrl = 'https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar';
    const sidebarUrlData = await ofetch(sidebarUrl);
    const list = sidebarUrlData.data[sec];

    const items = await Promise.all(list.filter((item) => item.contId).map((item) => utils.ProcessItem(item, ctx)));
    return {
        title: `澎湃新闻 - ${sections[sec] ?? sec}`,
        item: items,
        link: 'https://www.thepaper.cn',
    };
}
