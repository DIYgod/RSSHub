import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { headers, parseItems } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/pornstar/:username/:language?/:sort?',
    categories: ['multimedia', 'popular'],
    view: ViewType.Videos,
    example: '/pornhub/pornstar/june-liu/www/mr',
    parameters: {
        username: {
            description: 'username, part of the url e.g. `pornhub.com/pornstar/june-liu`',
        },
        language: {
            description: 'language',
            options: [
                { value: 'www', label: 'English' },
                { value: 'de', label: 'Deutsch' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'it', label: 'Italiano' },
                { value: 'ja', label: '日本語' },
                { value: 'pt', label: 'Português' },
                { value: 'pl', label: 'Polski' },
                { value: 'rt', label: 'Русский' },
                { value: 'nl', label: 'Dutch' },
                { value: 'cs', label: 'Czech' },
                { value: 'cn', label: '中文（简体）' },
            ],
            default: 'www',
        },
        sort: {
            description: 'sorting method, leave empty for `Best`',
            default: 'mr',
            options: [
                {
                    label: 'Most Recent',
                    value: 'mr',
                },
                {
                    label: 'Most Viewed',
                    value: 'mv',
                },
                {
                    label: 'Top Rated',
                    value: 'tr',
                },
                {
                    label: 'Longest',
                    value: 'lg',
                },
            ],
        },
    },
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
    name: 'Pornstar',
    maintainers: ['I2IMk', 'queensferryme'],
    handler,
};

async function handler(ctx) {
    const { language = 'www', username, sort = 'mr' } = ctx.req.param();
    let link = `https://${language}.pornhub.com/pornstar/${username}?o=${sort}`;
    if (!isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const { data: response } = await got(link, { headers });
    let $ = load(response);
    let items;

    if ($('.withBio').length === 0) {
        link = `https://${language}.pornhub.com/pornstar/${username}/videos?o=${sort}`;
        const { data: response } = await got(link, { headers });
        $ = load(response);
        items = $('#mostRecentVideosSection .videoBox')
            .toArray()
            .map((e) => parseItems($(e)));
    } else {
        items = $('#pornstarsVideoSection .videoBox')
            .toArray()
            .map((e) => parseItems($(e)));
    }

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
