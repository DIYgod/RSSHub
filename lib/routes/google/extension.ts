import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const response = await got<string>({
        method: 'get',
        url: `https://chrome.google.com/webstore/detail/${id}?hl=en`,
    });
    const $ = load(response.data);

    const version = 'v' + $('.pDlpAd').text();

    ctx.set('data', {
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
    });
};
