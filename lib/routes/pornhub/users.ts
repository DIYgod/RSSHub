import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { headers, parseItems } from './utils';

export const route: Route = {
    path: '/:language?/users/:username',
    categories: ['multimedia'],
    example: '/pornhub/users/pornhubmodels',
    parameters: { language: 'language, see below', username: 'username, part of the url e.g. `pornhub.com/users/pornhubmodels`' },
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
            source: ['pornhub.com/users/:username/*'],
            target: '/users/:username',
        },
    ],
    name: 'Users',
    maintainers: ['I2IMk', 'queensferryme'],
    handler,
};

async function handler(ctx) {
    const { language = 'www', username } = ctx.req.param();
    const link = `https://${language}.pornhub.com/users/${username}/videos`;
    if (!isValidHost(language)) {
        throw new Error('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('.videoUList .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    return {
        title: $('title').first().text(),
        description: $('.aboutMeText').text().trim(),
        link,
        image: $('#coverPictureDefault').attr('src'),
        logo: $('#getAvatar').attr('src'),
        icon: $('#getAvatar').attr('src'),
        language: $('html').attr('lang'),
        allowEmpty: true,
        item: items,
    };
}
