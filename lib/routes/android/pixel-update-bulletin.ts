import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/pixel-update-bulletin',
    categories: ['program-update'],
    example: '/android/pixel-update-bulletin',
    radar: [
        {
            source: ['source.android.com/docs/security/bulletin/pixel', 'source.android.com'],
        },
    ],
    name: 'Pixel Update Bulletins',
    maintainers: ['TonyRL'],
    handler,
    url: 'source.android.com/docs/security/bulletin/pixel',
};

async function handler() {
    const baseUrl = 'https://source.android.com';
    const link = `${baseUrl}/docs/security/bulletin/pixel`;

    const response = await ofetch(link, {
        headers: {
            Cookie: 'signin=autosignin; cookies_accepted=true; django_language=en;',
        },
    });

    const $ = load(response);

    const list = $('table tr:has(td:first-child a)')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('td:nth-child(1) a');
            return {
                title: `Pixel Update Bulletin ${a.text()}`,
                description: $item.find('td:nth-child(2)').html()?.trim(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('td:nth-child(3)').text()),
            };
        });

    return {
        title: $('head title').text(),
        link,
        image: $('link[rel="apple-touch-icon"]').attr('href'),
        item: list,
    };
}
