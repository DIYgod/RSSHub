import { Route } from '@/types';
import utils from './utils';
import { load } from 'cheerio';
import got from '@/utils/got';

export const route: Route = {
    path: '/the-read-down',
    categories: ['reading'],
    example: '/penguin-random-house/the-read-down',
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
            source: ['penguinrandomhouse.com/the-read-down'],
        },
    ],
    name: 'Book Lists',
    maintainers: ['StevenRCE0'],
    handler,
    url: 'penguinrandomhouse.com/the-read-down',
};

async function handler(ctx) {
    const link = 'https://www.penguinrandomhouse.com/the-read-down/';
    const res = await got(link);
    const $ = load(res.data);

    const itemArray = $('.archive-module-half-container,.archive-module-third-container')
        .map(function () {
            return {
                url: $(this).find('a').attr('href'),
                title: $(this).find('.archive-module-text').first().text(),
            };
        })
        .get();

    const out = await utils.parseList(itemArray, ctx, utils.parseBooks);

    return {
        title: 'Penguin Random House Book Lists',
        link,
        description: 'Never wonder what to read next! Check out these lists to find your next favorite book.',
        item: out,
    };
}
