import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { headers, parseItems } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/pornstar/:username/:language?/:sort?',
    categories: ['multimedia'],
    example: '/pornhub/pornstar/june-liu',
    parameters: { language: 'language, see below', username: 'username, part of the url e.g. `pornhub.com/pornstar/june-liu`', sort: 'sorting method, see below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['pornhub.com/pornstar/:username/*'],
            target: '/pornstar/:username',
        },
    ],
    name: 'Verified model / Pornstar',
    maintainers: ['I2IMk', 'queensferryme'],
    handler,
    description: `**\`sort\`**

  | Most Recent | Most Viewed | Top Rated | Longest | Best |
  | ----------- | ----------- | --------- | ------- | ---- |
  | mr          | mv          | tr        | lg      |      |`,
};

async function handler(ctx) {
    const { language = 'www', username, sort = 'mr' } = ctx.req.param();
    const link = `https://${language}.pornhub.com/pornstar/${username}?o=${sort}`;
    if (!isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    const $ = load(response);
    const items = $('#pornstarsVideoSection .videoBox')
        .toArray()
        .map((e) => parseItems($(e)));

    return {
        title: $('h1').first().text(),
        description: $('section.aboutMeSection').text().trim(),
        link,
        image: $('#coverPictureDefault').attr('src'),
        logo: $('#getAvatar').attr('src'),
        icon: $('#getAvatar').attr('src'),
        language: $('html').attr('lang'),
        item: items,
    };
}
