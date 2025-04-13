import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/wamazing/news',
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
            source: ['https://tw.wamazing.com/media/article'],
        },
    ],
    name: '文章一覽表',
    maintainers: ['david90103'],
    handler,
    url: 'tw.wamazing.com/',
};

async function handler() {
    const rootUrl = 'https://tw.wamazing.com/media/article';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);

    const $ = load(response.data);

    const items = $('section.wa-article-list')
        .children()
        .toArray()
        .map((item) => ({
            title: $(item).find('a').text(),
            description: $(item).find('p').text(),
            link: $(item).find('div a').attr('href'),
            pubDate: $(item).find('time span').text(),
        }));

    return {
        title: '完美行旅遊情報 - 文章一覽表',
        link: currentUrl,
        item: items,
    };
}
