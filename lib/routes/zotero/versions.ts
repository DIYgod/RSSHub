import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/versions',
    categories: ['program-update'],
    example: '/zotero/versions',
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
            source: ['zotero.org/', 'zotero.org/support/changelog'],
        },
    ],
    name: 'Version History',
    maintainers: ['jasongzy'],
    handler,
    url: 'zotero.org/',
};

async function handler() {
    const url = 'https://www.zotero.org/support/changelog';
    const response = await got(url);
    const data = response.data;
    const $ = load(data);
    const list = $('h2');

    return {
        title: 'Zotero - Version History',
        link: url,
        item: list.toArray().map((item) => {
            item = $(item);
            let date = $(item)
                .text()
                .match(/\((.*)\)/);
            date = Array.isArray(date) ? date[1] : null;
            return {
                title: item.text().trim(),
                description: $('<div/>').append(item.nextUntil('h2').clone()).html(),
                pubDate: date,
                link: url + '#' + item.attr('id'),
            };
        }),
    };
}
