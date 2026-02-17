import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { isValidHost } from '@/utils/valid-host';

import { getRadarDomin, headers, parseItems } from './utils';

export const route: Route = {
    path: '/users/:username/:language?',
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
        nsfw: true,
    },
    radar: getRadarDomin('/users/:username'),
    name: 'Users',
    maintainers: ['I2IMk', 'queensferryme'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { language = 'www', username } = ctx.req.param();
    const link = `https://${language}.pornhub.com/users/${username}/videos`;
    if (!isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('.videoUList .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    return {
        title: $('.profileUserName a').text(),
        description: $('.aboutMeText').text().trim(),
        link,
        image: $('#getAvatar').attr('src'),
        language: $('html').attr('lang'),
        allowEmpty: true,
        item: items,
    };
}
