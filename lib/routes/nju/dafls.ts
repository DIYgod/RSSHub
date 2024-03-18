import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/dafls',
    categories: ['university'],
    example: '/nju/dafls',
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
            source: ['dafls.nju.edu.cn/13167/list.html', 'dafls.nju.edu.cn/'],
        },
    ],
    name: '大学外语部',
    maintainers: ['ret-1'],
    handler,
    url: 'dafls.nju.edu.cn/13167/list.html',
};

async function handler() {
    const category_dict = {
        tzgg: '通知公告',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async (c) => {
            const response = await got(`https://dafls.nju.edu.cn/13167/list.htm`);

            const data = response.data;
            const $ = load(data);
            const list = $('#article97');

            // only read first page
            return list.map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').last().text(),
                    link: 'https://dafls.nju.edu.cn' + item.find('a').attr('href'),
                    pubDate: timezone(parseDate(item.find('span').last().text(), 'YYYY-MM-DD'), +8),
                    category: c,
                };
            });
        })
    );

    return {
        title: '大外部-通知公告',
        link: 'https://dafls.nju.edu.cn/13167/list.htm',
        item: [...items[0]],
    };
}
