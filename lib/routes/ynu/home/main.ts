import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { processPages } from '../utils';

export const route: Route = {
    path: '/home',
    categories: ['university'],
    example: '/ynu/home',
    radar: [{ source: ['www.ynu.edu.cn/ydkx.htm'] }],
    name: '云大快讯',
    maintainers: ['hzcheney'],
    handler,
};

async function handler() {
    const host = 'https://www.ynu.edu.cn/';

    const response = await ofetch('https://www.ynu.edu.cn/ydkx.htm');

    const $ = load(response);
    const list = $('.list li')
        .toArray()
        .map((e) => ({
            path: $('a', e).attr('href') ?? '',
            title: $('a', e).attr('title') ?? '',
            author: '云南大学',
        }));

    const out = await processPages({ list, host, department: 'home' });

    return {
        title: '云南大学云大快讯',
        link: 'https://www.ynu.edu.cn/ydkx.htm',
        description: '云南大学云大快讯',
        item: out,
    };
}
