import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/scut/yjs',
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
            source: ['www2.scut.edu.cn/graduate/14562/list.htm'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'www2.scut.edu.cn/graduate/14562/list.htm',
};

async function handler() {
    const baseUrl = 'https://www2.scut.edu.cn';
    const link = `${baseUrl}/graduate/14562/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w4 a');

    return {
        title: '华南理工大学研究生院',
        link,
        description: '华南理工大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    link: `${baseUrl}${item.attr('href')}`,
                    pubDate: parseDate(item.find('span').text()),
                };
            }),
    };
}
