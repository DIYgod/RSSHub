import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import cache from '@/utils/cache';
import { baseUrl as rootUrl, getItem } from './utils';

const config = {
    toutiao: {
        title: '头条',
        url: `${rootUrl}/v9zhuanqu/toutiao/index.htm`,
    },
    qswp: {
        title: '网评',
        url: `${rootUrl}/qswp.htm`,
    },
    qssp: {
        title: '视频',
        url: `${rootUrl}/qssp/index.htm`,
    },
    qslgxd: {
        title: '原创',
        url: `${rootUrl}/qslgxd/index.htm`,
    },
    economy: {
        title: '经济',
        url: `${rootUrl}/economy/index.htm`,
    },
    politics: {
        title: '政治',
        url: `${rootUrl}/politics/index.htm`,
    },
    culture: {
        title: '文化',
        url: `${rootUrl}/culture/index.htm`,
    },
    society: {
        title: '社会',
        url: `${rootUrl}/society/index.htm`,
    },
    cpc: {
        title: '党建',
        url: `${rootUrl}/cpc/index.htm`,
    },
    science: {
        title: '科教',
        url: `${rootUrl}/science/index.htm`,
    },
    zoology: {
        title: '生态',
        url: `${rootUrl}/zoology/index.htm`,
    },
    defense: {
        title: '国防',
        url: `${rootUrl}/defense/index.htm`,
    },
    international: {
        title: '国际',
        url: `${rootUrl}/international/index.htm`,
    },
    books: {
        title: '图书',
        url: `${rootUrl}/books/index.htm`,
    },
    xxbj: {
        title: '学习笔记',
        url: `${rootUrl}/qszq/xxbj/index.htm`,
    },
    llwx: {
        title: '理论文选',
        url: `${rootUrl}/qszq/llwx/index.htm`,
    },
};

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/qstheory',
    parameters: { industry: '分类，见下表' },
    radar: [
        {
            source: ['www.qstheory.cn/v9zhuanqu/:category/index.htm', 'www.qstheory.cn/qszq/:category/index.htm', 'www.qstheory.cn/:category/index.htm'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `
| 头条    | 网评 | 视频 | 原创   | 经济    | 政治     | 文化    | 社会    | 党建 | 科教    | 生态    | 国防    | 国际          | 图书  | 学习笔记 | 理论文选 |
| ------- | ---- | ---- | ------ | ------- | -------- | ------- | ------- | ---- | ------- | ------- | ------- | ------------- | ----- | -------- | -------- |
| toutiao | qswp | qssp | qslgxd | economy | politics | culture | society | cpc  | science | zoology | defense | international | books | xxbj     | llwx     |`,
};

async function handler(ctx) {
    const { category = 'toutiao' } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit')) || 50;

    const currentUrl = config[category].url;
    const response = await ofetch(currentUrl);

    const $ = cheerio.load(response);

    const list = $('.list-style1 ul li a, .text h2 a, .no-pic ul li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href')!,
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => getItem(item))));

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
