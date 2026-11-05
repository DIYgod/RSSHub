import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

dayjs.extend(utc);
dayjs.extend(timezone);

function parsePublicationDate(value: string | undefined) {
    if (!value) {
        return;
    }
    const date = value
        .replace(/on\s\w+?day\s/, '')
        .replace('@', '')
        .replace(/(\d{2}:\d{2})(\w{2})$/, '$1 $2');
    return parseDate(dayjs.tz(date, 'MMMM D, YYYY hh:mm A', 'America/New_York').toISOString());
}

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
                author: getPostedAuthor(details.find('.story-byline').text()),
                pubDate: parsePublicationDate(details.find('time').attr('datetime')),
            };
        });

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        item: list,
    };
}

function getPostedAuthor(text: string) {
    for (const prefix of text.matchAll(/Posted\s+by/g)) {
        const start = prefix.index + prefix[0].length;
        let bodyStart = start;
        while (bodyStart < text.length && /\s/.test(text[bodyStart])) {
            bodyStart++;
        }
        if (bodyStart === start) {
            continue;
        }
        let marker = text.indexOf('on', bodyStart);
        while (marker !== -1) {
            if (/\s/.test(text[marker - 1] ?? '') && /\s/.test(text[marker + 2] ?? '')) {
                let authorEnd = marker;
                while (authorEnd > bodyStart && /\s/.test(text[authorEnd - 1])) {
                    authorEnd--;
                }
                if (authorEnd > bodyStart) {
                    return text.slice(bodyStart, authorEnd).trim();
                }
            }
            marker = text.indexOf('on', marker + 2);
        }
        if (bodyStart - start >= 3 && text.startsWith('on', bodyStart) && /\s/.test(text[bodyStart + 2] ?? '')) {
            return '';
        }
        // A later prefix cannot succeed without also supplying a delimiter for this first prefix.
        return;
    }
}
