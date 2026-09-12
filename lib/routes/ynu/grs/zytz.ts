import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { processPages } from '../utils';

export const route: Route = {
    path: '/grs/zytz',
    categories: ['university'],
    example: '/ynu/grs/zytz',
    radar: [{ source: ['grs.ynu.edu.cn/*'] }],
    name: '研究生院重要通知（置顶消息）',
    maintainers: ['hzcheney'],
    handler,
};

async function handler() {
    const host = 'http://www.grs.ynu.edu.cn/';

    const response = await ofetch('http://www.grs.ynu.edu.cn/index.htm');

    const $ = load(response);
    const list = $('#news table table tbody tr')
        .slice(0, 9)
        .toArray()
        .map((e) => ({
            path: $('td a', e).attr('href') ?? '',
            title: $('td a', e).attr('title') ?? '',
            author: '研究生院',
        }));
    const out = await processPages({ list, host, department: 'grs' });

    return {
        title: '云南大学研究生院重要通知',
        link: host + 'zytz.htm',
        description: '云南大学研究生院重要通知',
        item: out,
    };
}
