import { Route } from '@/types';

import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'http://www.zyshow.net';
    const currentUrl = `${rootUrl}${getSubPath(ctx).replace(/\/$/, '')}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('table')
        .last()
        .find('tr td a img.icon-play')
        .toArray()
        .map((item) => {
            item = $(item).parentsUntil('tbody');

            const a = item.find('a[title]').first();
            const guests = item.find('td').eq(2).text();

            return {
                title: a.text(),
                link: `${currentUrl}v/${a.attr('href').split('/v/').pop()}`,
                pubDate: parseDate(a.text().match(/(\d{8})$/)[1], 'YYYYMMDD'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    date: item.find('td').first().text(),
                    subject: item.find('td').eq(1).text(),
                    guests,
                }),
                category: guests.split(/,|;/),
            };
        });

    return {
        title: `综艺秀 - ${$('h2').text()}`,
        link: currentUrl,
        item: items,
    };
}
