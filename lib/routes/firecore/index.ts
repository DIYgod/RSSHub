import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const platformNames = { ios: 'iOS / iPadOS', tvos: 'tvOS', macos: 'macOS' };

export const route: Route = {
    path: '/:os',
    categories: ['program-update'],
    example: '/firecore/ios',
    parameters: { os: '`ios`,`tvos`,`macos`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Release Notes',
    maintainers: ['NathanDai'],
    handler,
};

async function handler(ctx) {
    const os = ctx.req.param('os');
    if (!Object.hasOwn(platformNames, os)) {
        throw new InvalidParameterError('Unsupported platform. Choose ios, tvos, or macos.');
    }
    const host = 'https://firecore.com/releases';
    const { data } = await got(host);
    const $ = load(data);
    const items = $(`.release-section[data-platform="${platformNames[ctx.req.param('os')]}"]`)
        .find('article.release-entry')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.release-version').text();
            const date = $item.find('.card-body > div').first().find('span.text-muted').text();
            const pubDate = date ? parseDate(`${date} UTC`) : undefined;
            const content = $item.find('.card-body').children().slice(1);
            return {
                title,
                description: content
                    .toArray()
                    .map((item) => $(item).prop('outerHTML'))
                    .join(''),
                pubDate,
                guid: `${ctx.req.param('os')}:${title}`,
            };
        });

    return {
        title: `Infuse Release Notes (${ctx.req.param('os')})`,
        link: 'https://firecore.com/releases',
        item: items,
    };
}
