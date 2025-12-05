import type { Route } from '@/types';

import { getNoticeList } from './utils';

const url = 'https://njglyy.com/ygb/jypx/jypx.aspx';
const host = 'https://njglyy.com/ygb/jypx/';

export const route: Route = {
    path: '/ygbjypx',
    categories: ['government'],
    example: '/njglyy/ygbjypx',
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
            source: ['njglyy.com/ygb/jypx/jypx.aspx', 'njglyy.com/'],
        },
    ],
    name: '员工版教育培训',
    maintainers: ['real-jiakai'],
    handler,
    url: 'njglyy.com/ygb/jypx/jypx.aspx',
};

async function handler(ctx) {
    const out = await getNoticeList(ctx, url, host, '.mtbd-list > dl', 'a', 'dt', {
        title: '.detail',
        content: '.detail2',
        date: 'span:contains("发布时间")',
    });

    return {
        title: '南京鼓楼医院 -- 员工版教育培训',
        link: url,
        item: out,
    };
}
