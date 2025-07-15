import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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

    const response = await ofetch(`https://chrome.google.com/webstore/detail/${id}?hl=en`);
    const $ = load(response);

    const version = 'v' + $('.nBZElf').text();

    return {
        title: $('.Pa2dE').text() + ' - Google Chrome Extension',
        link: `https://chrome.google.com/webstore/detail/${id}`,
        image: $('.rBxtY').attr('src'),
        item: [
            {
                title: version,
                description: $('.JJ3H1e').html(),
                link: `https://chrome.google.com/webstore/detail/${id}`,
                pubDate: parseDate($('.uBIrad div').last().text()),
                guid: version,
                author: $('.cJI8ee').text(),
            },
        ],
    };
}
