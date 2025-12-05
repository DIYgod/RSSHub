import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

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
    const response = await ofetch('https://m.thepaper.cn', {
        headers: {
            Cookie: 'blackAndWhiteMode=0; redTops=0;',
        },
    });
    const $ = load(response);
    const nextData = $('#__NEXT_DATA__').text();
    const data = JSON.parse(nextData);
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
