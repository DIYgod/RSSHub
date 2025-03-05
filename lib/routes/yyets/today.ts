import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/today',
    categories: ['multimedia', 'popular'],
    view: ViewType.Notifications,
    example: '/yyets/today',
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
            source: ['yysub.net/tv/schedule', 'yysub.net/'],
        },
    ],
    name: '今日播出',
    maintainers: ['bao1991213'],
    handler,
    url: 'yysub.net/tv/schedule',
};

async function handler() {
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: 'https://yysub.net',
    });

    const data = response.data; // response.data 为 HTTP GET 请求返回的 HTML，也就是简书首页的所有 HTML

    const $ = load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('.today-list-wrap').find('ul').find('li');
    // 使用 cheerio 选择器，选择带有 data-item_id 属性的所有 div 元素，返回 cheerio node 对象数组

    // 注：每一个 cheerio node 对应一个 HTML DOM
    // 注：cheerio 选择器与 jquery 选择器几乎相同
    // 参考 cheerio 文档：https://cheerio.js.org/

    return {
        title: '人人影视-今日播出',
        link: 'https://yysub.net',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').first().text(),
                        link: item.find('a').attr('href'),
                        guid: item.find('a').first().text(),
                    };
                })
                .get(),
    };
}
