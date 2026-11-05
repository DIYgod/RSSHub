import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://downloads.ifi-audio.com';

export const route: Route = {
    path: '/download/:val/:id',
    categories: ['program-update'],
    example: '/ifi-audio/download/1503007035/44472',
    parameters: { val: 'product val', id: 'product id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Download Hub',
    maintainers: ['IvanWng97'],
    handler,
    description: `::: warning

1. Open <https://downloads.ifi-audio.com/support/download-hub> and the Network panel
2. Select the device and the corresponding serial number in the website and click Search
3. Find the last request named \`https://downloads.ifi-audio.com/wp-admin/admin-ajax.php\` in the Network panel, find out the val and id in the Payload panel, and fill in the url

:::`,
};

async function handler(ctx) {
    const { val, id } = ctx.req.param();

    const url = host + '/wp-admin/admin-ajax.php';
    const response = await got({
        method: 'post',
        url,
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: new URLSearchParams({ action: 'ifi-ff-get-firmware', val, id }).toString(),
    });
    const markup = response.data?.data?.markup;
    if (!response.data?.success || typeof markup !== 'string') {
        throw new Error('iFi did not return firmware information. Check the product ID and serial number in the official Download Hub.');
    }
    const $ = load(markup);
    const latestFirmware = $('li[data-category=firmware]').first();
    const latestTitle = $('li[data-category=firmware]:first h4').text();
    if (!latestTitle) {
        throw new Error('No firmware is listed for this product and serial number in the iFi Download Hub.');
    }
    const latestDownloadLink = $('li[data-category=firmware]:first a').attr('href');
    const releaseDate = $('li[data-category=firmware]:first .release-date')
        .text()
        .replace(/^Release date:\s*/, '');
    const pubDate = releaseDate ? parseDate(`${releaseDate} +00:00`, 'MMMM D, YYYY Z', true) : undefined;
    latestFirmware.children('h4, .release-date, .platforms').remove();
    return {
        title: 'iFi audio Download Hub',
        link: 'https://downloads.ifi-audio.com/support/download-hub/',
        description: 'iFi audio Download Hub',
        item: [
            {
                title: latestTitle,
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                description: latestFirmware.html() ?? undefined,
                link: latestDownloadLink,
                guid: latestDownloadLink ?? `ifi-audio:${id}:${latestTitle}`,
            },
        ],
    };
}
