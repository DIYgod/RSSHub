import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/chrome/extension/:id',
    categories: ['program-update'],
    example: '/google/chrome/extension/kefjpfngnndepjbopdmoebkipbgkggaa',
    parameters: { id: 'Extension id, can be found in extension url' },
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
            source: ['chromewebstore.google.com/detail/:name/:id'],
        },
    ],
    name: 'Extension Update',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got<string>({
        method: 'get',
        url: `https://chrome.google.com/webstore/detail/${id}?hl=en`,
    });
    const $ = load(response.data);

    const version = 'v' + $('.pDlpAd').text();

    return {
        title: $('.Pa2dE').text() + ' - Google Chrome Extension',
        link: `https://chrome.google.com/webstore/detail/${id}`,
        item: [
            {
                title: version,
                description: $('.uORbKe').html(),
                link: `https://chrome.google.com/webstore/detail/${id}`,
                pubDate: new Date($('.kBFnc').text().replace('Updated', '')).toUTCString(),
                guid: version,
                author: $('.yNyGQd').text(),
            },
        ],
    };
}
