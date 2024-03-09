import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/commercialpress/latest',
    categories: ['social-media'],
    example: '/douban/commercialpress/latest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '商务印书馆新书速递',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const link = 'https://site.douban.com/commercialpress/room/827243/';
    const { data: roomResponse } = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: 'https://site.douban.com/commercialpress/',
        },
    });
    let $ = load(roomResponse);
    const $mod = $('.mod').eq(0);
    const title = $mod.find('.hd > h2 span').eq(0).text();
    const newBookUrl = $mod.find('.pl a').attr('href');

    const newBookLandingPage = await got({
        method: 'get',
        url: newBookUrl,
        headers: {
            Referer: link,
        },
    });

    // 这个有个重定向，需要获取到真实地址后添加排序参数后再请求一次
    const realUrl = `${newBookLandingPage.request.options.url.href}?sort=time&sub_type=`;
    const newBookPage = await got({
        method: 'get',
        url: realUrl,
        headers: {
            Referer: link,
        },
    });

    $ = load(newBookPage.data);
    const resultItem = $('.doulist-item')
        .map((_, item) => {
            const $item = $(item);

            return {
                title: $item.find('.title > a').text(),
                link: $item.find('.title > a').attr('href'),
                description: `<img src="${$item.find('.post img').attr('src')}" /><br>${$item.find('.abstract').html()}`,
                pubDate: new Date($item.find('.time > span').attr('title')).toUTCString(),
            };
        })
        .get();

    return {
        title: `商务印书馆-${title}`,
        link,
        item: resultItem,
    };
}
