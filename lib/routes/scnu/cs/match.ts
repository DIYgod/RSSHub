import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cs/match',
    categories: ['university'],
    example: '/scnu/cs/match',
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
            source: ['cs.scnu.edu.cn/xueshenggongzuo/chengchangfazhan/kejichuangxin/', 'cs.scnu.edu.cn/'],
        },
    ],
    name: '计算机学院竞赛通知',
    maintainers: ['fengkx'],
    handler,
    url: 'cs.scnu.edu.cn/xueshenggongzuo/chengchangfazhan/kejichuangxin/',
};

async function handler() {
    const baseUrl = 'http://cs.scnu.edu.cn';
    const url = `${baseUrl}/xueshenggongzuo/chengchangfazhan/kejichuangxin/`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(res.data);
    const list = $('.listshow li a');

    return {
        title: $('title').text(),
        link: url,
        description: '华南师范大学计算机学院 学科竞赛',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    pubDate: parseDate(item.find('.r').text()),
                    link: item.attr('href'),
                };
            }),
    };
}
