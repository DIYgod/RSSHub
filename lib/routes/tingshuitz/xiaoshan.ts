import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/xiaoshan',
    categories: ['forecast'],
    example: '/tingshuitz/xiaoshan',
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
            source: ['www.xswater.com/gongshui/channels/227.html', 'www.xswater.com/'],
        },
    ],
    name: '萧山区',
    maintainers: ['znhocn'],
    handler,
    url: 'www.xswater.com/gongshui/channels/227.html',
};

async function handler() {
    // const area = ctx.req.param('area');
    const url = 'https://www.xswater.com/gongshui/channels/227.html';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const list = $('.ul-list li');

    return {
        title: $('title').text(),
        link: 'https://www.xswater.com/gongshui/channels/227.html',
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        description: `萧山区停水通知：${item.find('a').text()}`,
                        pubDate: new Date(item.find('span').text().slice(1, 11)).toUTCString(),
                        link: `https://www.xswater.com${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
}
