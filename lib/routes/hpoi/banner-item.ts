import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/bannerItem',
    categories: ['anime'],
    example: '/hpoi/bannerItem',
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
            source: ['www.hpoi.net/bannerItem/list'],
        },
    ],
    name: '热门推荐',
    maintainers: ['DIYgod'],
    handler,
    url: 'www.hpoi.net/bannerItem/list',
};

async function handler() {
    const link = 'https://www.hpoi.net/bannerItem/list?categoryId=0&bannerItemType=0&subType=0&page=1';
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);
    return {
        title: `Hpoi 手办维基 - 热门推荐`,
        link,
        item: $('#content .item')
            .toArray()
            .map((_item) => {
                _item = $(_item);
                return {
                    title: _item.find('.title').text(),
                    link: 'https://www.hpoi.net/' + _item.find('a').attr('href'),
                    description: `<img src="${_item.find('img').attr('src')}">`,
                    pubDate: new Date(_item.find('.time').text().replace('发布时间：', '')).toUTCString(),
                };
            }),
    };
}
