import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/tongji/yjs',
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
            source: ['yz.tongji.edu.cn/zsxw/ggtz.htm', 'yz.tongji.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yz.tongji.edu.cn/zsxw/ggtz.htm',
};

async function handler() {
    const link = 'https://yz.tongji.edu.cn/zsxw/ggtz.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list_main_content li');

    return {
        title: '同济大学研究生院',
        link,
        description: '同济大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    };
}
