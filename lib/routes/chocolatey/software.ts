import { load } from 'cheerio';
import type { Context } from 'hono';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/software/:name?',
    categories: ['program-update'],
    example: '/chocolatey/software/GoogleChrome',
    parameters: { name: 'Software name' },
    name: 'Software Update',
    maintainers: ['woodgear'],
    handler,
};

async function handler(ctx: Context) {
    const { name } = ctx.req.param();
    if (!name) {
        throw new NotFoundError('Missing software name. Use a Chocolatey package id, for example /chocolatey/software/GoogleChrome.');
    }
    const link = `https://community.chocolatey.org/packages/${name}`;

    const response = await ofetch(link);
    const $ = load(response);

    return {
        title: name,
        link,
        item: $('#versionhistory table tbody tr')
            .toArray()
            .map((row) => {
                const $tds = $(row).find('td');
                const $version = $tds.filter('.version');
                const href = $version.find('a').attr('href');
                const version = $version.find('span').first().text();
                const versionLink = href || (version ? `packages/${name}/${version}` : undefined);
                const time = $tds.eq(3).text();

                return {
                    title: $version.text().trim(),
                    link: versionLink ? new URL(versionLink, 'https://community.chocolatey.org').href : link,
                    description: `update_time: ${time}`,
                    pubDate: parseDate(time),
                };
            }),
    };
}
