import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const url = 'https://book.douban.com/latest';

export const route: Route = {
    path: '/book/latest',
    categories: ['social-media'],
    example: '/douban/book/latest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新书速递',
    maintainers: ['fengkx'],
    handler,
};

async function handler() {
    const res = await got.get(url);
    const $ = load(res.data);
    const list = $('#content').find('li').get();
    return {
        title: '豆瓣新书速递',
        link: url,
        item: list.map((item, index) => ({
            title: `${index < 20 ? '[虚构类]' : '[非虚构类]'}${$(item).find('h2').text().trim()}`,
            link: $(item).find('a').first().attr('href'),
            description: $(item).html(),
        })),
    };
}
