import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/ecust/yjs',
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
            source: ['gschool.ecust.edu.cn/12753/list.htm', 'gschool.ecust.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'gschool.ecust.edu.cn/12753/list.htm',
};

async function handler() {
    const baseUrl = 'https://gschool.ecust.edu.cn';
    const link = `${baseUrl}/12753/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w6 li');

    return {
        title: '华东理工大学研究生院',
        link,
        description: '华东理工大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    link: `${baseUrl}${item.find('a').attr('href')}`,
                    pubDate: parseDate(item.find('.news_meta').text()),
                };
            }),
    };
}
