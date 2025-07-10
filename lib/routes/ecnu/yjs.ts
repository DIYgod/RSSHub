import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/ecnu/yjs',
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
            source: ['yz.kaoyan.com/ecnu/tiaoji', 'yz.kaoyan.com/'],
        },
    ],
    name: '研究生院',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yz.kaoyan.com/ecnu/tiaoji',
};

async function handler() {
    const link = 'https://yz.kaoyan.com/ecnu/tiaoji/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.subList li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('li a').text(),
                link: item.find('li a').attr('href').replace('http:', 'https:'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.articleCon').html();
                item.pubDate = parseDate($('.outer_utime').text());
                return item;
            })
        )
    );

    return {
        title: '华东师范大学研究生院',
        link,
        description: '华东师范大学研究生调剂信息',
        item: items,
    };
}
