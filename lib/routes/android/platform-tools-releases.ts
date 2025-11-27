import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/platform-tools-releases',
    categories: ['program-update'],
    example: '/android/platform-tools-releases',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['developer.android.com/studio/releases/platform-tools', 'developer.android.com/'],
        },
    ],
    name: 'SDK Platform Tools release notes',
    maintainers: ['nczitzk'],
    handler,
    url: 'developer.android.com/studio/releases/platform-tools',
};

async function handler() {
    const rootUrl = 'https://developer.android.com';
    const currentUrl = `${rootUrl}/studio/releases/platform-tools`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            cookie: 'signin=autosignin',
        },
    });

    const $ = load(response.data);

    $('.hide-from-toc').remove();
    $('.devsite-dialog, .devsite-badge-awarder, .devsite-hats-survey').remove();

    const items = $('h4')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.attr('data-text');

            let description = '';
            item.nextUntil('h4').each(function () {
                description += $(this).html();
            });

            return {
                title,
                description,
                link: `${currentUrl}#${item.attr('id')}`,
                pubDate: parseDate(title.match(/\((.*)\)/)[1], 'MMMM YYYY'),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
