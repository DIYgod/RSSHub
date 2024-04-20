import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/scnu/yjs',
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
            source: ['yz.scnu.edu.cn/tongzhigonggao/ssgg', 'yz.scnu.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yz.scnu.edu.cn/tongzhigonggao/ssgg',
};

async function handler() {
    const link = 'https://yz.scnu.edu.cn/tongzhigonggao/ssgg/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.listmod div a');

    return {
        title: '华南师范大学研究生院',
        link,
        description: '华南师范大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.text(),
                    link: item.attr('href'),
                };
            }),
    };
}
