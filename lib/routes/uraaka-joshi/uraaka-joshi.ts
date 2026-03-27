import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['uraaka-joshi.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['SettingDust', 'Halcao'],
    handler,
    url: 'uraaka-joshi.com/',
    features: {
        nsfw: true,
    },
};

async function handler() {
    const link = `https://www.uraaka-joshi.com/`;
    const title = `裏垢女子まとめ`;

    const browser = await puppeteer();

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'fetch' ? request.continue() : request.abort();
    });
    page.on('requestfinished', async (request) => {
        if (request.url() === link && request.response().status() === 403) {
            await page.close();
        }
    });

    let html: string;
    try {
        await page.goto(link, {
            waitUntil: 'domcontentloaded',
        });

        await page.waitForSelector('#pickup03 .grid-cell');
        await page.waitForSelector('#pickup04 .grid-cell');
        await page.waitForSelector('#main-block .grid-cell');

        const bodyHandle = await page.$('body');
        html = await page.evaluate((body) => body.innerHTML, bodyHandle);
    } catch {
        throw new Error('Access denied (403)');
    }
    await browser.close();

    const $ = load(html);
    const list = $('.grid-cell');

    return {
        title,
        link,
        item: list.toArray().map((item) => {
            item = $(item);

            // remove event and styles
            item.find('*').removeAttr('onclick');
            item.find('*').removeAttr('onerror');
            item.find('*').removeAttr('style');

            // format account style
            const account = item.find('.account-group-link-row');
            account.html(account.text());

            // extract video tag from its player
            item.find('.plyr--video').each((_, player) => {
                player = $(player);

                const video = player.find('video');
                player.replaceWith(video);
                const poster = video.attr('data-poster');
                video.attr('poster', 'https:' + poster);

                const source = video.find('source');
                const src = source.attr('src');
                source.attr('src', 'https:' + src);
            });

            // correct src of img tags
            item.find('img').each((_, image) => {
                const src = $(image).attr('data-src');
                $(image).attr('src', 'https:' + src);
            });

            return {
                title: item.find('.account-group').text() + ` - ${title}`,
                description: item.html(),
                link: item.find('.account-group-link-row').attr('href'),
                pubDate: parseDate(item.find('.profile-char').attr('datetime')),
                guid: item.find('a.tap-image').attr('data-tweet-id') || item.find('video[class^="js-player-"]').attr('data-tweet-id') || parseDate(item.find('.profile-char').attr('datetime')).getTime(),
            };
        }),
    };
}
