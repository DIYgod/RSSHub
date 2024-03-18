import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/hqjt',
    categories: ['university'],
    example: '/nju/hqjt',
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
            source: ['webplus.nju.edu.cn/_s25/main.psp'],
        },
    ],
    name: '后勤集团',
    maintainers: ['ret-1'],
    handler,
    url: 'webplus.nju.edu.cn/_s25/main.psp',
};

async function handler() {
    const category_dict = {
        zbcg: '招标采购',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async () => {
            const response = await got(`https://webplus.nju.edu.cn/_s25/zbcg/list.psp`);

            const data = response.data;
            const $ = load(data);
            const list = $('li.news');

            // only read first page
            return list.map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    link: 'https://webplus.nju.edu.cn' + item.find('a').attr('href'),
                    pubDate: timezone(parseDate(item.find('span').last().text(), 'YYYY-MM-DD'), +8),
                    category: category_dict[0],
                };
            });
        })
    );

    return {
        title: '后勤集团-招标采购',
        link: 'https://webplus.nju.edu.cn/_s25/zbcg/list.psp',
        item: [...items[0]],
    };
}
