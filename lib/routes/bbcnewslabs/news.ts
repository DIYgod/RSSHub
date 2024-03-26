import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/bbcnewslabs/news',
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
            source: ['bbcnewslabs.co.uk/'],
        },
    ],
    name: 'News',
    maintainers: ['elxy'],
    handler,
    url: 'bbcnewslabs.co.uk/',
};

async function handler() {
    const rootUrl = 'https://bbcnewslabs.co.uk';
    const response = await got({
        method: 'get',
        url: `${rootUrl}/news`,
    });

    const $ = load(response.data);

    const items = [...$('a[href^="/news/20"]')]
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h3[class^="thumbnail-module--thumbnailTitle--"]').text(),
                description: item.find('span[class^="thumbnail-module--thumbnailDescription--"]').text(),
                pubDate: parseDate(item.find('span[class^="thumbnail-module--thumbnailType--"]').text()),
                link: rootUrl + item.attr('href'),
            };
        })
        .get();

    return {
        title: 'News - BBC News Labs',
        link: rootUrl,
        item: items,
    };
}
