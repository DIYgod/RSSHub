import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { isValidHost } from '@/utils/valid-host';

import { getRadarDomin, headers, parseItems } from './utils';

export const route: Route = {
    path: '/model/:username/:language?/:sort?',
    categories: ['multimedia'],
    view: ViewType.Videos,
    example: '/pornhub/model/stacy-starando',
    parameters: { language: 'language, see below', username: 'username, part of the url e.g. `pornhub.com/model/stacy-starando`', sort: 'sorting method, see below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: getRadarDomin('/model/:username'),
    name: 'Model',
    maintainers: ['I2IMk', 'queensferryme'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { language = 'www', username, sort = '' } = ctx.req.param();
    const link = `https://${language}.pornhub.com/model/${username}/videos${sort ? `?o=${sort}` : ''}`;
    if (!isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('#mostRecentVideosSection .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    return {
        title: $('h1').first().text(),
        description: $('section.aboutMeSection').text().trim(),
        link,
        image: $('#getAvatar').attr('src'),
        language: $('html').attr('lang'),
        item: items,
    };
}
