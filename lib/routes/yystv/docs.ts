import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/docs',
    categories: ['game'],
    example: '/yystv/docs',
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
            source: ['yystv.cn/docs'],
        },
    ],
    name: '游研社 - 全部文章',
    maintainers: ['HaitianLiu'],
    handler,
    url: 'yystv.cn/docs',
};

async function handler() {
    const url = `https://www.yystv.cn/docs`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);

    const items = $('.list-container li')
        .slice(0, 18)
        .map(function () {
            const info = {
                title: $('.list-article-title', this).text(),
                link: 'https://www.yystv.cn' + $('a', this).attr('href'),
                pubDate: parseRelativeDate($('.c-999', this).text()),
                author: $('.handler-author-link', this).text(),
                description: $('.list-article-intro', this).text(),
            };
            return info;
        })
        .get();

    return {
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/docs`,
        item: items,
    };
}
