import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
export const route: Route = {
    path: '/security-bulletin',
    categories: ['program-update'],
    example: '/android/security-bulletin',
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
            source: ['source.android.com/docs/security/bulletin', 'source.android.com/docs/security/bulletin/asb-overview', 'source.android.com/'],
        },
    ],
    name: 'Security Bulletins',
    maintainers: ['TonyRL'],
    handler,
    url: 'source.android.com/docs/security/bulletin/asb-overview',
};

async function handler() {
    const baseUrl = 'https://source.android.com';
    const link = `${baseUrl}/docs/security/bulletin/asb-overview`;

    const response = await ofetch(link, {
        headers: {
            Cookie: 'signin=autosignin; cookies_accepted=true; django_language=en;',
        },
    });

    const $ = load(response);

    const items = $('table tr')
        .slice(1)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('td:nth-child(1) a');
            return {
                title: `Bulletin ${a.text()}`,
                description: $item.find('td:nth-child(2)').html(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate($item.find('td:nth-child(3)').text()),
            };
        });

    return {
        title: $('title').text(),
        link,
        image: $('link[rel="apple-touch-icon"]').attr('href'),
        item: items,
    };
}
