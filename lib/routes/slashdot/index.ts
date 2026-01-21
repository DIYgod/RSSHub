import { load } from 'cheerio';

import { InvalidParameterError } from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/:section?',
    categories: ['new-media'],
    example: '/slashdot',
    parameters: { section: 'Section name, can be found in the URL host, leave empty for the main page' },
    radar: [
        {
            source: ['slashdot.org'],
        },
        {
            source: ['devices.slashdot.org'],
            target: '/devices',
        },
        {
            source: ['build.slashdot.org'],
            target: '/build',
        },
        {
            source: ['entertainment.slashdot.org'],
            target: '/entertainment',
        },
        {
            source: ['technology.slashdot.org'],
            target: '/technology',
        },
        {
            source: ['science.slashdot.org'],
            target: '/science',
        },
        {
            source: ['yro.slashdot.org'],
            target: '/yro',
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { section } = ctx.req.param();

    if (section && !isValidHost(section)) {
        throw new InvalidParameterError('Invalid section name');
    }

    const link = section ? `https://${section}.slashdot.org` : 'https://slashdot.org';
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.article')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.story-title a').first();
            const details = $item.find('.details');

            return {
                title: a.text(),
                link: a.attr('href'),
                description: $item.find('.body').html(),
                pubDate: parseDate(
                    details
                        .find('time')
                        .attr('datetime')
                        ?.replace(/on\s\w+?day\s/, '')
                        ?.replace('@', '')
                        ?.replace(/(\d{2}:\d{2})(\w{2})$/, '$1 $2')
                ),
            };
        });

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        item: list,
    };
}
