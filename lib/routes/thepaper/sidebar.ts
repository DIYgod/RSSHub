import type { Route } from '@/types';
import got from '@/utils/got';

import utils from './utils';

const sections = {
    hotNews: '澎湃热榜',
    financialInformationNews: '澎湃财讯',
    morningEveningNews: '早晚报',
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
    parameters: { sec: '侧边栏 id，可选 `hotNews` 即 澎湃热榜、`financialInformationNews` 即 澎湃财讯、`morningEveningNews` 即 早晚报，默认为 `hotNews`' },
    maintainers: ['bigfei'],
    handler,
    url: 'thepaper.cn/',
};

async function handler(ctx) {
    const { sec = 'hotNews' } = ctx.req.param();

    const sidebar_url = `https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar`;
    const sidebar_url_resp = await got(sidebar_url);
    const sidebar_url_data = sidebar_url_resp.data;
    const list = sidebar_url_data.data[sec];

    const items = await Promise.all(list.filter((item) => item.contId).map((item) => utils.ProcessItem(item, ctx)));
    return {
        title: `澎湃新闻 - ${sections[sec]}`,
        item: items,
        link: 'https://www.thepaper.cn',
    };
}
