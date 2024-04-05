import { Route } from '@/types';
import utils from './utils';
import { load } from 'cheerio';
import got from '@/utils/got';

export const route: Route = {
    path: '/articles',
    categories: ['reading'],
    example: '/penguin-random-house/articles',
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
            source: ['penguinrandomhouse.com/articles'],
        },
    ],
    name: 'Articles',
    maintainers: ['StevenRCE0'],
    handler,
    url: 'penguinrandomhouse.com/articles',
};

async function handler(ctx) {
    const link = 'https://www.penguinrandomhouse.com/articles/';
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

    const out = await utils.parseList(itemArray, ctx, utils.parseArticle);

    return {
        title: 'Penguin Random House Articles',
        link,
        description: 'In-depth interviews, author essays, fascinating essays. Go deeper into the books you love.',
        item: out,
    };
}
