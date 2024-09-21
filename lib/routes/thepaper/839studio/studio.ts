import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/839studio',
    name: 'Unknown',
    maintainers: ['umm233'],
    handler,
};

async function handler() {
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: 'http://projects.thepaper.cn/thepaper-cases/839studio/?lang=zh',
    });

    const data = response.data;

    // 使用 cheerio 加载返回的 HTML
    const $ = load(data);
    const list = $('div[class=imgtext]');

    return {
        title: '澎湃美数课作品集',
        link: 'http://projects.thepaper.cn/thepaper-cases/839studio/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.imgup a').first().text(),
                        description: `描述：${item.find('.imgdown p').text()}`,
                        link: item.find('.imgup a').attr('href'),
                    };
                })
                .get(),
    };
}
