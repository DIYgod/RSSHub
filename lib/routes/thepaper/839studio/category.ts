import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/839studio/:id',
    radar: [
        {
            source: ['thepaper.cn/'],
        },
    ],
    name: '澎湃美数课作品集 - 分类',
    maintainers: ['umm233'],
    handler,
    url: 'thepaper.cn/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `http://projects.thepaper.cn/thepaper-cases/839studio/?cat=${id}`;

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    // 使用 cheerio 加载返回的 HTML
    const $ = load(data);
    const list = $('div[class=imgtext]');

    const category = $('div[class=lefth]').find('h1').text();
    const desc = $('div[class=leftc]').find('p').text();

    return {
        title: `澎湃美数课作品集-${category}`,
        link,
        description: desc,
        item: list.toArray().map((item) => {
            item = $(item);
            return {
                title: item.find('.archive_up a').first().text(),
                description: `描述：${item.find('.imgdown p').text()}`,
                link: item.find('.archive_up a').attr('href'),
            };
        }),
    };
}
