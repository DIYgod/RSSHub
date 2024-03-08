import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { headers, parseItems } from './utils';

export const route: Route = {
    path: '/:language?/category_url/:url?',
    categories: ['picture'],
    example: '/pornhub/category_url/video%3Fc%3D15%26o%3Dmv%26t%3Dw%26cc%3Djp',
    parameters: { language: 'language, see below', url: 'relative path after `pornhub.com/`, need to be URL encoded' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Video List',
    maintainers: ['I2IMk', 'queensferryme'],
    handler,
};

async function handler(ctx) {
    const { language = 'www', url = 'video' } = ctx.req.param();
    const link = `https://${language}.pornhub.com/${url}`;
    if (!isValidHost(language)) {
        throw new Error('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('#videoCategory .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    return {
        title: $('title').first().text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
}
