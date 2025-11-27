import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/featured',
    categories: ['new-media'],
    example: '/thepaper/featured',
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
            source: ['thepaper.cn/'],
        },
    ],
    name: '首页头条',
    maintainers: ['HenryQW', 'nczitzk', 'bigfei'],
    handler,
    url: 'thepaper.cn/',
};

async function handler(ctx) {
    const response = await got('https://m.thepaper.cn');
    const data = JSON.parse(load(response.data)('#__NEXT_DATA__').html());
    const list = [...data.props.pageProps.data.list, ...data.props.pageProps.topData.recommendImg];

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    return {
        title: '澎湃新闻 - 首页头条',
        link: 'https://m.thepaper.cn',
        item: items,
        itunes_author: '澎湃新闻',
        image: utils.ExtractLogo(response),
    };
}
