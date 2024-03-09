import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
export const route: Route = {
    path: '/tv/followrank',
    categories: ['anime'],
    example: '/bangumi/tv/followrank',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['bgm.tv/anime'],
    },
    name: '成员关注动画榜',
    maintainers: ['honue'],
    handler,
    url: 'bgm.tv/anime',
};

async function handler() {
    const url = 'https://bgm.tv/anime';
    const response = await got({
        url,
        method: 'get',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response.body);

    const items = [
        ...$('#columnB > div:nth-child(4) > table > tbody')
            .find('tr')
            .toArray()
            .map((item) => {
                const aTag = $(item).children('td').next().find('a');
                return {
                    title: aTag.html(),
                    link: 'https://bgm.tv' + aTag.attr('href'),
                };
            }),
        ...$('#chl_subitem > ul')
            .find('li')
            .toArray()
            .map((item) => ({
                title: $(item).children('a').attr('title'),
                link: 'https://bgm.tv' + $(item).children('a').attr('href'),
            })),
    ];

    return {
        title: 'Bangumi 成员关注动画榜',
        link: url,
        item: items,
        description: `Bangumi 首页-成员关注动画榜`,
    };
}
