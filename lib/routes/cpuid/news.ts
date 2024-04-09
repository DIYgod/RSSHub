import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const newsUrl = 'https://www.cpuid.com/news.html';

export const route: Route = {
    path: '/news',
    categories: ['program-update'],
    example: '/cpuid/news',
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
            source: ['cpuid.com/news.html', 'cpuid.com/'],
        },
    ],
    name: 'News',
    maintainers: [],
    handler,
    url: 'cpuid.com/news.html',
};

async function handler() {
    const response = await got(newsUrl);
    const $ = load(response.data);

    const items = $('.block_100 .js-block-news')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.information a').text(),
                description: item.find('.description').html(),
                link: item.find('.information a').attr('href'),
                pubDate: parseDate(item.find('time[itemprop=dateCreated]').attr('datetime')),
            };
        });

    return {
        title: $('head title').text(),
        description: $('head description').attr('content'),
        link: newsUrl,
        image: $('link[rel=apple-touch-icon-precomposed]').attr('href'),
        item: items,
        language: $('html').attr('lang'),
    };
}
