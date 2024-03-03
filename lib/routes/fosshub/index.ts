// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://www.fosshub.com';
    const currentUrl = `${rootUrl}/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const version = $('dd[itemprop="softwareVersion"]').first().text();

    const items = [
        {
            title: version,
            link: `${currentUrl}#${version}`,
            description: art(path.join(__dirname, 'templates/description.art'), {
                links: $('.dwn-dl')
                    .toArray()
                    .map((l) =>
                        $(l)
                            .find('.w')
                            .toArray()
                            .map((w) => ({
                                dt: $(w).find('dt').text(),
                                dd: $(w).find('dd').html(),
                            }))
                    ),
                changelog: $('div[itemprop="releaseNotes"]').html(),
            }),
            pubDate: parseDate($('.ma__upd .v').text(), 'MMM DD, YYYY'),
        },
    ];

    ctx.set('data', {
        title: `${$('#fh-ssd__hl').text()} - FossHub`,
        link: currentUrl,
        item: items,
    });
};
